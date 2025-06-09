const jwt = require('jsonwebtoken');
const { authenticateToken, authenticateAndAuthorize, checkPermissions } = require('../../src/middlewares/authMiddleware');
const { RoleTypes, ErrorMsg } = require('../../src/constants');

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn(() => res),
      send: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should return 403 if no token is provided', () => {
      req.header.mockReturnValue(null);

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith('Invalid Token');
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', () => {
      req.header.mockReturnValue('Bearer invalid-token');
      jwt.verify.mockImplementation((token, secret, callback) => callback(new Error('Invalid Token')));

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith('Invalid Token');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if token is valid', () => {
      req.header.mockReturnValue('Bearer valid-token');
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { username: 'test-user' }));

      authenticateToken(req, res, next);

      expect(req.user).toEqual({ username: 'test-user' });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authenticateAndAuthorize', () => {
    it('should return 403 if no token is provided', () => {
      req.header.mockReturnValue(null);

      const middleware = authenticateAndAuthorize(RoleTypes.ADMIN);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(ErrorMsg.AUTH.INVALID_TOKEN);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', () => {
      req.header.mockReturnValue('Bearer invalid-token');
      jwt.verify.mockImplementation((token, secret, callback) => callback(new Error('Invalid Token')));

      const middleware = authenticateAndAuthorize(RoleTypes.ADMIN);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(ErrorMsg.AUTH.INVALID_TOKEN);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have sufficient permissions', () => {
      req.header.mockReturnValue('Bearer valid-token');
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { username: 'test-user', role: RoleTypes.USER }));

      const middleware = authenticateAndAuthorize(RoleTypes.ADMIN);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith(ErrorMsg.AUTH.NO_PERMISSION);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user has sufficient permissions', () => {
      req.header.mockReturnValue('Bearer valid-token');
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { username: 'test-user', role: RoleTypes.ADMIN }));

      const middleware = authenticateAndAuthorize(RoleTypes.ADMIN);
      middleware(req, res, next);

      expect(req.user).toEqual({ username: 'test-user', role: RoleTypes.ADMIN });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('checkPermissions', () => {
    it('should return true if user has sufficient permissions', () => {
      expect(checkPermissions(RoleTypes.ADMIN, RoleTypes.USER)).toBe(true);
    });

    it('should return false if user does not have sufficient permissions', () => {
      expect(checkPermissions(RoleTypes.USER, RoleTypes.ADMIN)).toBe(false);
    });

    it('should return false without any parameter', () => {
      expect(checkPermissions(null, RoleTypes.ADMIN)).toBe(false);
      expect(checkPermissions(RoleTypes.MANAGER, null)).toBe(false);
    });
  });
});
