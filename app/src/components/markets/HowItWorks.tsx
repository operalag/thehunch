export function HowItWorks() {
  return (
    <div className="how-it-works">
      <h3>How Bonds Work</h3>
      <div className="steps">
        <div className="step">
          <span className="step-number">1</span>
          <div className="step-content">
            <h4>Propose</h4>
            <p>Bond minimum 10,000 HNCH to propose YES or NO</p>
          </div>
        </div>
        <div className="step">
          <span className="step-number">2</span>
          <div className="step-content">
            <h4>Challenge</h4>
            <p>Bond 2x to challenge with opposite answer</p>
          </div>
        </div>
        <div className="step">
          <span className="step-number">3</span>
          <div className="step-content">
            <h4>Resolve</h4>
            <p>After 4 hours without challenge, outcome is final</p>
          </div>
        </div>
        <div className="step">
          <span className="step-number">4</span>
          <div className="step-content">
            <h4>Claim</h4>
            <p>Winners get their bond back + loser's bond</p>
          </div>
        </div>
      </div>
    </div>
  );
}
