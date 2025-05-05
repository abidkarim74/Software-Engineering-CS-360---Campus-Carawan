export const VerificationEmailTemplate = (code: string) => `
<!DOCTYPE html><html><body>
  <h2>Verify Your Email</h2>
  <p>Your verification code is:</p>
  <pre style="font-size:20px;">${code}</pre>
  <p>This code expires in 10 minutes.</p>
</body></html>`;

export default VerificationEmailTemplate;
