const mjml2html = require('mjml');

const OtpCodeEmail = (otp) => {
  const currentYear = new Date().getFullYear();
  
  const { html, errors } = mjml2html(`
    <mjml>
      <mj-head>
        <mj-title>OTP Verification</mj-title>
        <mj-font name="Poppins" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" />
        <mj-attributes>
          <mj-all font-family="Poppins, Helvetica, Arial, sans-serif" />
          <mj-text font-weight="400" color="#4A4A4A" />
        </mj-attributes>
      </mj-head>
      
      <mj-body background-color="#f7f7f7">
        <!-- Header Section -->
        <mj-section padding="20px 0">
          <mj-column>
            <mj-text align="center" color="#333" font-size="24px" font-weight="600" padding="10px 25px">
              Your Verification Code
            </mj-text>
          </mj-column>
        </mj-section>
        
        <!-- Main Content Card -->
        <mj-section background-color="#ffffff" padding="20px 0" border-radius="8px">
          <mj-column>
            <mj-text align="center" padding="10px 25px" font-size="16px">
              Hello, here's your one-time password (OTP) for verification:
            </mj-text>
            
            <!-- OTP Display -->
            <mj-text align="center" font-size="18px" padding="10px 0">
              Your OTP code is:
            </mj-text>
            
            <mj-table css-class="otp-table" width="100%">
              <tr>
                <td style="
                  letter-spacing: 10px;
                  text-align: center;
                  font-size: 32px;
                  font-weight: 600;
                  color: #2B6CB0;
                  padding: 15px 20px;
                  background: #EBF4FF;
                  border-radius: 6px;
                  margin: 0 auto;
                ">
                  ${otp}
                </td>
              </tr>
            </mj-table>
            
            <mj-text align="center" padding="10px 25px" font-size="14px" color="#666">
              This code will expire in 15 minutes. Please don't share it with anyone.
            </mj-text>
            
            <mj-divider border-width="1px" border-color="#eaeaea" padding="10px 25px" />
            
            <mj-text align="center" padding="10px 25px" font-size="12px" color="#999">
              If you didn't request this code, you can safely ignore this email.
            </mj-text>
          </mj-column>
        </mj-section>
        
        <!-- Footer -->
        <mj-section padding="20px 0">
          <mj-column>
            <mj-text align="center" font-size="12px" color="#999" padding="10px 25px">
              © ${currentYear} Your Company Name. All rights reserved.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `);

  if (errors && errors.length > 0) {
    console.error('MJML compilation errors:', errors);
    throw new Error('Failed to generate email template');
  }

  return html;
};

module.exports = OtpCodeEmail;