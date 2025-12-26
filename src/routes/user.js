import { Hono } from 'hono';
import { createUserService, createEmailService } from '../utils/serviceFactory.js';
import { authMiddleware } from '../middleware/auth.js';
import { createSuccessResponse, getClientIP } from '../utils/helpers.js';
import { userRoutes_log, error_log } from '../utils/debug.js';
import { tSuccess } from '../i18n/index.js';
import { i18nValidatorsMiddleware } from '../middleware/i18nValidator.js';
// import { zValidator } from '@hono/zod-validator'; // Removed: using i18n validators only
// Import removed: now using i18n validators only
// import { createUserSchema, updateProfileSchema } from '../schemas/user.js';
import { getFeatureFlags } from '../utils/dynamicConfig.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';
import { handleStandardError } from '../utils/errorHandler.js';
import { ROLES } from '../constants/roles.js';

const user = new Hono();

// Apply auto middleware for all user routes
user.use('*', unifiedMiddlewares.auto());

/**
 * Helper function to get user actor information for logging
 * @param {Object} c - Hono context
 * @returns {string} Actor identifier
 */
function getUserActor(c) {
  const userPayload = c.get('user');
  return userPayload?.full_name || userPayload?.email || `User ID: ${userPayload?.user_id}` || 'Anonymous';
}

// GET /profile - Get profile information with i18n support (requires authentication)
// GET /me - Alias for profile with i18n support

user.on('GET', ['/profile', '/me'], authMiddleware, async (c) => {
  const userPayload = c.get('user');

  userRoutes_log(`User me request for user: ${userPayload.user_id}`);

  try {
    const userService = createUserService(c.env);

    const userDetails = await userService.findById(userPayload.user_id);

    if (!userDetails) {
      userRoutes_log(`User me request failed: user not found: ${userPayload.user_id}`);
      return await handleStandardError(c, new Error('NOT_FOUND'), 'Get user profile - not found', userRoutes_log, 'user.notFound', { userName: `User ID: ${userPayload.user_id}` }, 404);
    }

    userRoutes_log(`User me retrieved successfully for user: ${userPayload.user_id}`);

    return c.json(createSuccessResponse({
      id: userDetails.id,
      full_name: userDetails.full_name,
      email: userDetails.email,
      status: userDetails.status,
      created_at: userDetails.created_at,
      role: userDetails.role
    }, tSuccess(c, 'user.profileRetrieved', {
      userName: userDetails.full_name,
      userRole: userDetails.role,
      requestedBy: getUserActor(c)
    })));

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve user profile', error_log, 'user.notFound', { userName: 'User' });
  }
});

// POST /register - Register new user with i18n support
user.post('/register', i18nValidatorsMiddleware.register(), async (c) => {
  userRoutes_log('User registration request');

  try {
    const { full_name, email, password } = c.req.valid('json');

    const userService = createUserService(c.env);
    const emailService = createEmailService(c.env);

    // Use register method from UserService
    const featureFlags = await getFeatureFlags(c.env);
    const result = await userService.register({
      full_name,
      email,
      password
    }, featureFlags.autoActivateUserOnRegister);

    if (!result.success) {
      // Handle different types of errors
      if (result.error === 'EMAIL_EXISTS') {
        userRoutes_log(`Registration failed: email already exists: ${email}`);
        return await handleStandardError(c, new Error('EMAIL_EXISTS'), 'Update user profile - email exists', userRoutes_log, 'user.emailExists', { email }, 400);
      }

      if (result.error === 'CREATE_FAILED') {
        userRoutes_log(`Registration failed: could not create user in database: ${email}`);
        return await handleStandardError(c, new Error(result.error), 'Registration failed: DB create user error', error_log, 'user.createFailed', { email, reason: 'Database error' }, 500);
      }

      if (result.error === 'REGISTRATION_ERROR') {
        userRoutes_log(`Registration failed: general registration error: ${result.details || 'Unknown error'}`);
        return await handleStandardError(c, new Error(result.details || 'REGISTRATION_ERROR'), 'Registration failed: general registration error', error_log, 'user.registrationError', { details: result.details }, 500);
      }

      userRoutes_log(`Registration failed with unknown error: ${result.error}`);
      return await handleStandardError(c, new Error(result.error), 'Registration failed with unknown error', error_log, 'system.serverError');
    }

    userRoutes_log(`User registered successfully with ID: ${result.data.id}, email: ${email}`);

    // Send confirmation email (best-effort; does not block registration success)
    const emailStatus = { sent: false, skipped: false, provider: null };
    try {
      const sendResult = await emailService.sendRegistrationConfirmation({
        id: result.data.id,
        full_name,
        email,
        status: result.data.status
      }, {
        locale: c.get('language'),
        ipAddress: getClientIP(c),
        userAgent: c.req.header('user-agent') || 'Unknown'
      });

      emailStatus.sent = sendResult?.success && !sendResult?.skipped;
      emailStatus.skipped = Boolean(sendResult?.skipped);
      emailStatus.provider = sendResult?.provider || null;
      emailStatus.reason = sendResult?.reason || sendResult?.error || null;

      if (!sendResult?.success) {
        userRoutes_log(`Registration email send did not complete successfully: ${emailStatus.reason || 'unknown reason'}`);
      }
    } catch (emailError) {
      emailStatus.sent = false;
      emailStatus.reason = emailError.message;
      userRoutes_log(`Registration email send error: ${emailError.message}`);
    }

    const successKey = result.data.status === 'active' ? 'user.registered' : 'user.registeredPendingActivation';

    return c.json(createSuccessResponse({
      ...result.data,
      email_notification: emailStatus
    }, tSuccess(c, successKey, {
      userName: full_name,
      userRole: result.data.role || ROLES.USER
    })), 201);

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to register new user', error_log, 'user.registrationError', { details: error.message });
  }
});

// PUT /profile - Update profile information with XSS protection
// PUT /me - Alias for profile update with XSS protection
user.on('PUT', ['/profile', '/me'], authMiddleware, i18nValidatorsMiddleware.updateProfile(), async (c) => {
  const userPayload = c.get('user');

  userRoutes_log(`Profile update request for user: ${userPayload.user_id}`);

  try {
    const updateData = c.req.valid('json'); // This data is now XSS-protected by Zod schema
    const userService = createUserService(c.env);

    // Check if new email conflicts (if email is being changed)
    if (updateData.email) {
      const existingUser = await userService.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== userPayload.user_id) {
        return await handleStandardError(c, new Error('EMAIL_EXISTS'), 'Update user profile (PUT) - email exists', userRoutes_log, 'user.emailExists', { email: updateData.email }, 400);
      }
    }

    // Update user information (data is already sanitized by Zod schema)
    await userService.update(userPayload.user_id, updateData);

    // Get user information after update
    const updatedUser = await userService.findById(userPayload.user_id);

    userRoutes_log(`Profile updated successfully for user: ${userPayload.user_id}`);

    return c.json(createSuccessResponse({
      id: updatedUser.id,
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      status: updatedUser.status,
      created_at: updatedUser.created_at,
      role: updatedUser.role
    }, tSuccess(c, 'user.updated', {
      userName: updatedUser.full_name,
      updatedFields: Object.keys(updateData).join(', ')
    })));

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to update user profile', error_log, 'user.updateFailed', { userName: 'User', reason: error.message });
  }
});

// POST /change-password - Change password with i18n support
user.on(['PUT', 'POST'], '/change-password', authMiddleware, i18nValidatorsMiddleware.changePassword(), async (c) => {
  const userPayload = c.get('user');

  userRoutes_log(`Password change request for user: ${userPayload.user_id}`);

  try {
    const { currentPassword, newPassword } = c.req.valid('json');
    const userService = createUserService(c.env);

    // Use changePassword method from UserService
    const result = await userService.changePassword(
      userPayload.user_id,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      // Handle different types of errors
      if (result.error === 'USER_NOT_FOUND') {
        return await handleStandardError(c, new Error('NOT_FOUND'), 'Change password - user not found', userRoutes_log, 'user.notFound', { userName: `User ID: ${userPayload.user_id}` }, 404);
      }

      if (result.error === 'INVALID_CURRENT_PASSWORD') {
        userRoutes_log(`Password change failed: current password incorrect for user: ${userPayload.user_id}`);
        return await handleStandardError(c, new Error('PASSWORD_INCORRECT'), 'Change password - incorrect current password', userRoutes_log, 'user.passwordIncorrect', {}, 400);
      }

      userRoutes_log(`Password change failed: ${result.error}`);
      return await handleStandardError(c, new Error(result.error), 'Password change failed with unknown error', error_log, 'system.serverError');
    }

    userRoutes_log(`Password changed successfully for user: ${userPayload.user_id}`);

    const userDetails = await userService.findById(userPayload.user_id);

    return c.json(createSuccessResponse({}, tSuccess(c, 'user.passwordChanged', {
      userName: userDetails?.full_name || 'User'
    })));

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to change user password', error_log, 'user.passwordChangeFailed', { userName: 'User', reason: error.message });
  }
});

export default user;
