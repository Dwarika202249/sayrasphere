import express from "express";
import passport from "passport";
import jsonwebtoken from "jsonwebtoken";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} from "../controllers/authController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);

// Helper for tokens on OAuth
const generateTokens = (userId: string) => {
  const accessToken = jsonwebtoken.sign(
    { id: userId },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" },
  );
  const refresh = jsonwebtoken.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" },
  );
  return { accessToken, refreshToken: refresh };
};

// Google OAuth endpoints
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  async (req: any, res) => {
    // Generate tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      req.user.id,
    );

    // Save refresh token to user (optional but recommended since we do it for direct logins)
    req.user.refreshTokens.push(newRefreshToken);
    await req.user.save();

    // Redirect to frontend with tokens in URL
    // A better approach for prod is sending as HttpOnly Cookies, but we're using LocalStorage
    res.redirect(
      `${process.env.CLIENT_URL}/oauth-success?accessToken=${accessToken}&refreshToken=${newRefreshToken}`,
    );
  },
);

export default router;
