export const welcome_text = `
<p><b>Ihr Konto wurde erfolgreich registriert und verifiziert, wodurch Sie nun alle
    Funktionen der App kostenfrei nutzen können!</b> Bei Fragen oder anderen Anliegen
    wenden Sie sich gerne an unseren Support
    <a href="mailto:korbkumpel+support@gmail.com">korbkumpel+support@gmail.com</a>,
    auch bei administratorischen Änderungen, wie beispielsweise das Umbenennen einer Liste,
    können Sie uns gerne kontaktieren!
    Außerdem müssen wir Ihnen mitteilen, dass – trotz unseres Bedauerns – KorbKumpel noch einige
    Fehler enthalten kann. Beim Auftreten solcher, melden Sie sich bitte unter
    <a href="mailto:korbkumpel+debugging@gmail.com">korbkumpel+debugging@gmail.com</a> und teilen
    Sie uns – falls angegeben – den Error-Code mit. Vielen Dank für Ihre Unterstützung!
</p>
<p>KorbKumpel wird ständig weiterentwickelt, wodurch immer wieder neue Updates veröffentlicht werden.
    Die neuen Funktionen werden Ihnen mitgeteilt, damit Sie immer auf dem neuesten Stand sind. Wenn Sie
    solche Informationen nicht erhalten wollen, verwenden Sie die Schaltfläche "Abbestellen" oder melden
    Sie sich bei <a href="mailto:korbkumpel+information@gmail.com">korbkumpel+information@gmail.com</a>.
</p>
`;

export function with_user_request(new_user, code) {
    return `
    <p>Der Benutzer ${new_user} will ein gemeinsames Konto mit Ihnen erstellen. Wenn Sie diesem zustimmen, 
    können Sie beide dieselben Listen bearbeiten und einsehen.</p>
    <p>Bitte öffnen Sie folgenden Link und akzeptieren Sie die Anfrage oder lehnen Sie diese ab: </p>
    <a href="https://korbkumpel.web.app/app/account/registration/register/with-user?code=${code}&username=${new_user}" target="_blank"
       style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
       With-User-Anfrage akzeptieren oder ablehnen
    </a>
    <p>Bei weiteren Fragen wenden Sie sich bitte an <a href="mailto:korbkumpel+support@gmail.com">korbkumpel+support@gmail.com</a>!</p>
`
}

export const with_user_request_declined = `
    <p>Der Hauptnutzer, welchen Sie angefragt haben, hat ein gemeinsames Konto mit Ihnen leider abgelehnt. </p>
    <p>Falls Sie einen neuen Hauptnutzer anfragen wollen, antworten Sie bitte auf diese E-Mail.</p>
    <p>Bei weiteren Fragen wenden Sie sich bitte an <a href="mailto:korbkumpel+support@gmail.com">korbkumpel+support@gmail.com</a>!</p>
`;

export const with_user_request_accepted = `
    <p>Der Hauptnutzer, welchen Sie angefragt haben, hat ein gemeinsames Konto mit Ihnen akzeptiert. </p>
    <p>Sie können nun auf die selben Listen zugreifen.</p>
    <p>Bei weiteren Fragen wenden Sie sich bitte an <a href="mailto:korbkumpel+support@gmail.com">korbkumpel+support@gmail.com</a>!</p>
`;