import style from "../terms/index.module.css";
import popcraftLogo from '../../images/popcraft_logo.webp';

export function Privacy() {
  return (
    <div>
      <div className={style.topBarContainer}>
        <img className={style.topBarContainerImg} src={popcraftLogo} alt="PopCraft Logo" />
      </div>

      <div className={style.contentsContainer}>
        <h1 className={style.termsTitle}>Privacy Policy</h1>
        <p>This Privacy Policy explains how MetaCat ("we," "us," or "our") collects, uses, shares, and protects your personal information when you use our website and services at <a href="https://popcraft.pixelaw.xyz/">https://popcraft.pixelaw.xyz/</a>. By using PopCraft, you agree to the practices described in this Privacy Policy.</p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li><strong>Wallet Address</strong>: Used to facilitate blockchain transactions and in-game asset ownership.</li>
          <li><strong>IP Address</strong>: Used for security and compliance monitoring.</li>
          <li><strong>Game Behavior</strong>: Includes gameplay actions, scores, and achievements.</li>
          <li><strong>Device Information</strong>: Includes browser type, operating system, and other technical details.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide and improve PopCraft’s game functionality.</li>
          <li>To enhance user experience and optimize our services.</li>
          <li>To ensure compliance with legal and regulatory requirements.</li>
        </ul>

        <h2>3. Data Sharing with Third Parties</h2>
        <ul>
          <li><strong>Analytics Providers</strong>: To analyze gameplay and improve user experience.</li>
          <li><strong>Advertising Partners</strong>: To provide relevant advertisements and promotions.</li>
          <li><strong>Business Partners</strong>: For collaboration and service enhancement.</li>
        </ul>

        <h2>4. Data Storage and Security</h2>
        <p>Your data is stored <strong>without encryption</strong>. Users <strong>cannot delete their data</strong> once collected. We take reasonable security measures but cannot guarantee absolute protection.</p>

        <h2>5. Cookies and Tracking Technologies</h2>
        <p>We use cookies and similar technologies to collect information about your interactions with PopCraft, including session tracking and analytics.</p>

        <h2>6. User Rights</h2>
        <ul>
          <li>Users <strong>can access</strong> their data.</li>
          <li>Users <strong>cannot modify or delete</strong> their data.</li>
        </ul>

        <h2>7. Legal Compliance</h2>
        <p>This Privacy Policy is governed by the <strong>laws of Singapore</strong>. Any disputes will be resolved under Singaporean jurisdiction.</p>

        <h2>8. Contact Information</h2>
        <p>For any questions regarding this Privacy Policy, please contact us at: [support email]</p>

        <p>By using PopCraft, you acknowledge that you have read and agreed to this Privacy Policy.</p>
      </div>
    </div>
  )
}