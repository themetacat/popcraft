import style from "./index.module.css";
import popcraftLogo from '../../images/popcraft_logo.webp';

export function Terms() {
    return (
        <div>
            <div className={style.topBarContainer}>
                <img className={style.topBarContainerImg} src={popcraftLogo} alt="PopCraft Logo" />
            </div>

            <div className={style.contentsContainer}>
                <h1 className={style.termsTitle}>Terms of Service</h1>
                <p>These Terms of Service ("Terms") govern your access to and use of PopCraft ("the Website"), operated by MetaCat ("the Company"). By accessing or using our services, you agree to comply with these Terms. If you do not agree, please do not use PopCraft.</p>

                <h2>1. Eligibility</h2>
                <p>PopCraft is intended for a global audience; however, it is <strong>not recommended for children</strong>. By using our services, you confirm that you are legally allowed to enter into these Terms in your jurisdiction.</p>

                <h2>2. User Conduct</h2>
                <p>You agree to use PopCraft in a lawful manner and not to:</p>
                <ul>
                    <li>Engage in cheating, exploiting, or any form of abuse.</li>
                    <li>Use bots, automation, or other unauthorized means to manipulate the game.</li>
                    <li>Attempt to interfere with the platform's functionality.</li>
                </ul>
                <p>We reserve the right to suspend or terminate accounts violating these rules.</p>

                <h2>3. Ownership of Game Assets</h2>
                <p>All in-game assets, including but not limited to NFTs and points, <strong>belong to the users</strong> and can be freely transferred. PopCraft does not interfere with asset ownership unless required by law or platform integrity.</p>

                <h2>4. Purchases and Refunds</h2>
                <p>PopCraft offers in-game purchases. <strong>All sales are final, and refunds are not supported</strong> unless required by applicable laws.</p>

                <h2>5. Limitation of Liability</h2>
                <p>Metacat provides PopCraft "as is" without warranties. We are <strong>not liable for game crashes, data loss, or other interruptions</strong>. Users assume all risks associated with using our services.</p>

                <h2>6. Dispute Resolution</h2>
                <p>Any disputes arising from these Terms shall be <strong>resolved through arbitration administered by the Singapore International Arbitration Centre (SIAC), in accordance with its arbitration rules</strong>. The arbitration decision will be final and binding.</p>

                <h2>7. Modification and Termination of Services</h2>
                <p>Metacat reserves the right to modify or discontinue any aspect of PopCraft at any time, without prior notice. We may also terminate or restrict access to users violating these Terms.</p>

                <h2>8. Contact Information</h2>
                <p>For any questions regarding these Terms, please contact us at: [support email]</p>

                <p>By continuing to use PopCraft, you acknowledge that you have read and agreed to these Terms of Service.</p>
            </div>
        </div>
    )
}