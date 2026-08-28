export default async function handler(req, res) {

    // ================================
    // CORS
    // ================================

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );


    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }


    // ================================
    // ONLY ALLOW POST
    // ================================

    if (req.method !== "POST") {

        return res.status(405).json({
            success: false,
            message: "Method not allowed."
        });

    }


    // ================================
    // CHECK WEBHOOK
    // ================================

    const webhook =
        process.env.DISCORD_APPLICATION_WEBHOOK;


    if (!webhook) {

        console.error(
            "DISCORD_APPLICATION_WEBHOOK is not configured."
        );

        return res.status(500).json({
            success: false,
            message: "Application service is not configured."
        });

    }


    try {

        const application = req.body;


        // ================================
        // BASIC VALIDATION
        // ================================

        if (!application || typeof application !== "object") {

            return res.status(400).json({
                success: false,
                message: "Invalid application data."
            });

        }


        const requiredFields = [
            "firstName",
            "lastName",
            "discord",
            "email",
            "age"
        ];


        for (const field of requiredFields) {

            if (
                application[field] === undefined ||
                application[field] === null ||
                String(application[field]).trim() === ""
            ) {

                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`
                });

            }

        }


        // ================================
        // SANITIZE VALUES
        // ================================

        const clean = value => {

            if (value === undefined || value === null) {
                return "N/A";
            }

            return String(value)
                .trim()
                .slice(0, 1000);

        };


        const firstName = clean(application.firstName);
        const lastName = clean(application.lastName);
        const discord = clean(application.discord);
        const email = clean(application.email);
        const age = clean(application.age);

        const phone = clean(application.phone);
        const timezone = clean(application.timezone);
        const availability = clean(application.availability);

        const experience = clean(application.experience);
        const motivation = clean(application.motivation);
        const additional = clean(application.additional);

        const department =
            clean(application.department || "LAFD");


        // ================================
        // APPLICATION ID
        // ================================

        const applicationId =
            "FIMS-" +
            Date.now().toString(36).toUpperCase();


        // ================================
        // CURRENT TIME
        // ================================

        const submittedAt =
            new Date().toISOString();


        // ================================
        // DISCORD EMBED
        // ================================

        const payload = {

            username: "LAFD FIMS",

            embeds: [

                {

                    title:
                        "📋 New FIMS Application",

                    description:
                        `A new application has been submitted through the Fire Inspection Management System.`,

                    color: 11801115,

                    fields: [

                        {
                            name: "Application ID",
                            value: `\`${applicationId}\``,
                            inline: true
                        },

                        {
                            name: "Department",
                            value: department,
                            inline: true
                        },

                        {
                            name: "Submitted",
                            value: `<t:${Math.floor(
                                Date.now() / 1000
                            )}:F>`,
                            inline: true
                        },

                        {
                            name: "Applicant",
                            value:
                                `${firstName} ${lastName}`,
                            inline: true
                        },

                        {
                            name: "Age",
                            value: age,
                            inline: true
                        },

                        {
                            name: "Discord",
                            value: discord,
                            inline: true
                        },

                        {
                            name: "Email",
                            value: email,
                            inline: false
                        },

                        {
                            name: "Phone",
                            value: phone,
                            inline: true
                        },

                        {
                            name: "Timezone",
                            value: timezone,
                            inline: true
                        },

                        {
                            name: "Availability",
                            value: availability,
                            inline: false
                        },

                        {
                            name: "Previous Experience",
                            value: experience,
                            inline: false
                        },

                        {
                            name: "Why do you want to join?",
                            value: motivation,
                            inline: false
                        },

                        {
                            name: "Additional Information",
                            value: additional,
                            inline: false
                        }

                    ],

                    footer: {

                        text:
                            "LAFD FIMS • Application System"

                    },

                    timestamp:
                        submittedAt

                }

            ]

        };


        // ================================
        // SEND TO DISCORD
        // ================================

        const discordResponse =
            await fetch(webhook, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)

            });


        if (!discordResponse.ok) {

            const errorText =
                await discordResponse.text();

            console.error(
                "Discord webhook error:",
                errorText
            );

            return res.status(502).json({
                success: false,
                message:
                    "Unable to deliver application."
            });

        }


        // ================================
        // SUCCESS
        // ================================

        return res.status(200).json({

            success: true,

            message:
                "Application submitted successfully.",

            applicationId

        });


    } catch (error) {

        console.error(
            "Application error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "An unexpected error occurred."

        });

    }

}
