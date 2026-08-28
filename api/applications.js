export default async function handler(req, res) {


// ============================================================
// CORS
// ============================================================

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


// ============================================================
// ONLY ALLOW POST
// ============================================================

if (req.method !== "POST") {

    return res.status(405).json({

        success: false,

        message:
            "Method not allowed."

    });

}


// ============================================================
// DISCORD WEBHOOK
// ============================================================

const webhook =
    process.env.DISCORD_APPLICATION_WEBHOOK;


if (!webhook) {

    console.error(
        "DISCORD_APPLICATION_WEBHOOK is not configured."
    );

    return res.status(500).json({

        success: false,

        message:
            "Application service is not configured."

    });

}


try {

    // ========================================================
    // GET APPLICATION
    // ========================================================

    const application =
        req.body;


    if (
        !application ||
        typeof application !== "object" ||
        Array.isArray(application)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid application data."

        });

    }


    // ========================================================
    // SANITIZE
    // ========================================================

    const clean = value => {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            return "N/A";

        }


        if (typeof value === "object") {

            try {

                return JSON.stringify(value);

            } catch {

                return "N/A";

            }

        }


        return String(value)
            .trim()
            .slice(0, 1000);

    };


    // ========================================================
    // APPLICATION TYPE
    // ========================================================

    const applicationType =
        clean(
            application.applicationType ||
            application.type ||
            "General FIMS Application"
        );


    // ========================================================
    // APPLICATION ID
    // ========================================================

    const applicationId =
        "FIMS-" +
        Date.now()
            .toString(36)
            .toUpperCase();


    // ========================================================
    // SUBMISSION TIME
    // ========================================================

    const submittedAt =
        new Date();


    const unixTimestamp =
        Math.floor(
            submittedAt.getTime() / 1000
        );


    // ========================================================
    // FIELD LABELS
    //
    // Converts:
    // applicantName -> Applicant Name
    // installationAddress -> Installation Address
    // openFlameCooking -> Open Flame Cooking
    // ========================================================

    const formatLabel = key => {

        return key

            .replace(/([A-Z])/g, " $1")

            .replace(/^./, char =>
                char.toUpperCase()
            )

            .replace(/Id/g, "ID")

            .replace(/Zip/g, "ZIP");

    };


    // ========================================================
    // FIELDS TO EXCLUDE
    // ========================================================

    const ignoredFields = [

        "applicationType",

        "type"

    ];


    // ========================================================
    // BUILD DISCORD FIELDS
    // ========================================================

    const fields = [];


    for (
        const [key, value]
        of Object.entries(application)
    ) {

        if (
            ignoredFields.includes(key)
        ) {

            continue;

        }


        const label =
            formatLabel(key);


        let fieldValue =
            clean(value);


        // Discord embed field values
        // cannot exceed 1024 characters.

        if (
            fieldValue.length > 1024
        ) {

            fieldValue =
                fieldValue.slice(
                    0,
                    1021
                ) + "...";

        }


        fields.push({

            name:
                label,

            value:
                fieldValue,

            inline:
                fieldValue.length <= 100

        });

    }


    // ========================================================
    // APPLICATION INFORMATION
    // ========================================================

    fields.unshift({

        name:
            "Application ID",

        value:
            `\`${applicationId}\``,

        inline:
            true

    });


    fields.unshift({

        name:
            "Submitted",

        value:
            `<t:${unixTimestamp}:F>`,

        inline:
            true

    });


    fields.unshift({

        name:
            "Application Type",

        value:
            applicationType,

        inline:
            true

    });


    // ========================================================
    // DISCORD HAS A MAXIMUM OF 25 EMBED FIELDS
    //
    // If a form contains more than 22 fields, split them
    // into multiple embeds.
    // ========================================================

    const chunks = [];


    for (
        let i = 0;
        i < fields.length;
        i += 25
    ) {

        chunks.push(
            fields.slice(
                i,
                i + 25
            )
        );

    }


    // ========================================================
    // CREATE EMBEDS
    // ========================================================

    const embeds =
        chunks.map(
            (chunk, index) => {

                return {

                    title:
                        index === 0
                            ? "📋 New FIMS Application"
                            : `📋 FIMS Application — Part ${index + 1}`,

                    description:
                        index === 0
                            ? `A new **${applicationType}** has been submitted through the Fire Inspection Management System.`
                            : `Additional information for application \`${applicationId}\`.`,

                    color:
                        11801115,

                    fields:
                        chunk,

                    footer: {

                        text:
                            "LAFD FIMS • Application System"

                    },

                    timestamp:
                        submittedAt.toISOString()

                };

            }
        );


    // ========================================================
    // DISCORD PAYLOAD
    // ========================================================

    const payload = {

        username:
            "LAFD FIMS",

        embeds:
            embeds

    };


    // ========================================================
    // SEND TO DISCORD
    // ========================================================

    const discordResponse =
        await fetch(
            webhook,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        payload
                    )

            }
        );


    // ========================================================
    // DISCORD ERROR
    // ========================================================

    if (
        !discordResponse.ok
    ) {

        const errorText =
            await discordResponse.text();


        console.error(
            "Discord webhook error:",
            errorText
        );


        return res.status(502).json({

            success:
                false,

            message:
                "Unable to deliver application."

        });

    }


    // ========================================================
    // SUCCESS
    // ========================================================

    console.log(
        `FIMS application ${applicationId} submitted successfully.`
    );


    return res.status(200).json({

        success:
            true,

        message:
            "Application submitted successfully.",

        applicationId

    });


} catch (error) {

    // ========================================================
    // UNEXPECTED ERROR
    // ========================================================

    console.error(
        "FIMS application error:",
        error
    );


    return res.status(500).json({

        success:
            false,

        message:
            "An unexpected error occurred."

    });

}


}
