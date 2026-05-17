import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

interface HomeProps {
  onLogin: () => void;
}

export function Home({ onLogin }: HomeProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const canLogin = userId.trim().length > 0 && password.trim().length > 0 && acceptedTerms;

  const handleLogin = () => {
    if (canLogin) {
      onLogin();
    }
  };

  return (
    <div className="page login-page">
      <section className="login-layout">
        <div className="login-copy">
          <span className="eyebrow">CloudShift Radar</span>
          <h1>Analyze cloud migration risks before moving your application.</h1>
          <p>
            Bob reviews repository scan signals, connects technical risk to feature impact, and produces the final
            migration readiness report.
          </p>
        </div>

        <Card className="login-card">
          <div className="section-heading">
            <span>Login</span>
            <h2>Access migration readiness</h2>
          </div>
          <label>
            Email or User ID
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Enter your email or user ID"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
            />
            I accept the Terms & Services
          </label>
          <Button disabled={!canLogin} onClick={handleLogin}>
            Log in
          </Button>
          <button className="text-button" type="button">
            Forgot password?
          </button>
        </Card>
      </section>
    </div>
  );
}
