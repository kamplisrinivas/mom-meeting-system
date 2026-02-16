const meetingScheduleTemplate = (data) => {
  const {
    scheduledBy,
    meeting_datetime,
    venue,
    meetingCustomId,
    subject,
    agenda,
  } = data;

  return `
<div style="font-family: 'Arial Black', Gadget, sans-serif; max-width: 500px; margin: 0 auto; background-color: #0d1b3e; color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #000;">
    
    <div style="padding: 40px 30px 20px 30px; text-align: left;">
        <h1 style="margin: 0; font-size: 60px; line-height: 0.9; text-transform: uppercase; color: #ffffff; letter-spacing: -2px;">MONTHLY</h1>
        <h1 style="margin: 0; font-size: 60px; line-height: 0.9; text-transform: uppercase; color: #f9a01b; letter-spacing: -2px;">MEETING</h1>
        
        <div style="background-color: #f9a01b; color: #0d1b3e; padding: 8px 15px; margin-top: 20px; display: inline-block; border-radius: 4px; font-weight: bold; font-size: 18px; width: 85%; text-align: center;">
            ${scheduledBy || "SLRM ADMIN"}
        </div>
    </div>

    <div style="padding: 0 30px 20px 30px;">
        <table style="width: 100%;">
            <tr>
                <td style="width: 60px; vertical-align: top;">
                    <span style="font-size: 45px;">📅</span>
                </td>
                <td style="color: #ffffff; font-family: Arial, sans-serif;">
                    <div style="font-size: 24px; font-weight: bold;">${meeting_datetime}</div>
                    <div style="font-size: 14px; color: #cccccc; margin-top: 5px;">📍 ${venue || "TBA"}</div>
                    <div style="font-size: 14px; color: #f9a01b; margin-top: 5px; font-weight: bold;">ID: #${meetingCustomId}</div>
                </td>
            </tr>
        </table>

        <div style="margin-top: 20px; font-family: Arial, sans-serif; border-left: 3px solid #f9a01b; padding-left: 15px;">
            <div style="font-weight: bold; color: #f9a01b; text-transform: uppercase; font-size: 12px;">Subject</div>
            <div style="font-size: 16px; margin-bottom: 10px;">${subject}</div>
            <div style="font-weight: bold; color: #f9a01b; text-transform: uppercase; font-size: 12px;">Agenda</div>
            <div style="font-size: 14px; color: #dddddd; line-height: 1.4;">${agenda || "No agenda provided."}</div>
        </div>

        <div style="margin-top: 30px;">
            <a href="https://reallygreatsite.com" style="background-color: #f9a01b; color: #0d1b3e; padding: 12px 25px; text-decoration: none; font-weight: 900; font-size: 20px; border-radius: 4px; display: inline-block; text-transform: uppercase;">
                JOIN NOW
            </a>
            <div style="display: inline-block; margin-left: 15px; font-family: Arial, sans-serif; font-size: 12px; color: #ffffff; vertical-align: middle;">
                +123-456-7890<br>
                reallygreatsite.com
            </div>
        </div>
    </div>

    <div style="padding: 0 20px 20px 20px; background-color: #f9a01b;">
        <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 4px solid #ffffff;">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500" alt="Meeting" style="width: 100%; display: block;">
        </div>
        <div style="text-align: center; padding: 10px; color: #0d1b3e; font-size: 10px; font-weight: bold; letter-spacing: 1px;">
            POWERED BY SLRM MIS ERP
        </div>
    </div>
</div>
`;
};

module.exports = {
  meetingScheduleTemplate,
};