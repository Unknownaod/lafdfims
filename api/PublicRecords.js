// /api/PublicRecords.js

export default async function handler(req, res) {

    /*
     * ==========================================
     * METHOD CHECK
     * ==========================================
     */

    if (req.method !== "POST") {

        return res.status(405).json({
            success: false,
            message: "Method not allowed."
        });

    }


    try {

        /*
         * ==========================================
         * GET REQUEST BODY
         * ==========================================
         */

        let data = req.body;

        // Some hosting configurations may provide
        // the body as a JSON string.
        if (typeof data === "string") {

            try {
                data = JSON.parse(data);
            } catch (error) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid JSON request."
                });

            }

        }


        /*
         * ==========================================
         * BASIC CHECK
         * ==========================================
         */

        if (!data || typeof data !== "object") {

            return res.status(400).json({
                success: false,
                message: "No request data was provided."
            });

        }


        /*
         * ==========================================
         * DISCORD WEBHOOK
         *
         * IMPORTANT:
         *
         * Add this to your hosting provider's
         * environment variables:
         *
         * LAFD_PUBLIC_RECORDS_WEBHOOK_URL
         *
         * DO NOT put the webhook in frontend code.
         * ==========================================
         */

        const webhook =
            process.env.LAFD_PUBLIC_RECORDS_WEBHOOK_URL;


        if (!webhook) {

            console.error(
                "LAFD_PUBLIC_RECORDS_WEBHOOK_URL is not configured."
            );

            return res.status(500).json({
                success: false,
                message:
                    "Public records service is not configured."
            });

        }


        /*
         * ==========================================
         * CLEAN / SANITIZE VALUES
         * ==========================================
         */

        const clean = (
            value,
            fallback = "N/A"
        ) => {

            if (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
            ) {

                return fallback;

            }

            return String(value)
                .replace(/@everyone/gi, "@\u200beveryone")
                .replace(/@here/gi, "@\u200bhere")
                .trim();

        };


        /*
         * Discord embed field values cannot exceed
         * 1024 characters.
         */

        const fieldValue = (
            value,
            fallback = "N/A"
        ) => {

            const cleaned =
                clean(value, fallback);

            return cleaned.substring(0, 1024);

        };


        /*
         * ==========================================
         * REQUEST INFORMATION
         * ==========================================
         */

        const requestType =
            clean(
                data.requestType,
                "General Records Request"
            );

        const requestNumber =
            clean(
                data.requestNumber,
                "Not assigned"
            );


        /*
         * ==========================================
         * COMMON VALUES
         * ==========================================
         */

        const name =
            fieldValue(data.name);

        const organization =
            fieldValue(data.organization);

        const email =
            fieldValue(data.email);


        /*
         * ==========================================
         * DETERMINE REQUEST TYPE
         * ==========================================
         */

        let title =
            "New General Records Request";

        let color =
            11800859;

        let fields = [];


        /*
         * ==========================================
         * CPRA REQUEST
         * ==========================================
         */

        if (
            requestType === "CPRA Request"
        ) {

            title =
                "New CPRA Request";

            color =
                11800859;


            fields = [

                {
                    name: "Request Number",
                    value: requestNumber,
                    inline: true
                },

                {
                    name: "Name",
                    value: name,
                    inline: true
                },

                {
                    name: "Organization",
                    value: organization,
                    inline: true
                },

                {
                    name: "Email",
                    value: email,
                    inline: true
                },

                {
                    name: "Response Format",
                    value:
                        fieldValue(data.format),
                    inline: true
                },

                {
                    name: "Record Category",
                    value:
                        fieldValue(data.category),
                    inline: true
                },

                {
                    name: "Date From",
                    value:
                        fieldValue(data.dateFrom),
                    inline: true
                },

                {
                    name: "Date To",
                    value:
                        fieldValue(data.dateTo),
                    inline: true
                },

                {
                    name: "Records Requested",
                    value:
                        fieldValue(data.records),
                    inline: false
                },

                {
                    name: "Additional Information",
                    value:
                        fieldValue(data.additional),
                    inline: false
                }

            ];

        }


        /*
         * ==========================================
         * PERSONAL APPEARANCE REQUEST
         * ==========================================
         */

        else if (
            requestType === "Personal Appearance Request"
        ) {

            title =
                "New Personal Appearance Request";

            color =
                11800859;


            fields = [

                {
                    name: "Request Number",
                    value: requestNumber,
                    inline: true
                },

                {
                    name: "Name",
                    value: name,
                    inline: true
                },

                {
                    name: "Organization",
                    value: organization,
                    inline: true
                },

                {
                    name: "Email",
                    value: email,
                    inline: true
                },

                {
                    name: "Case Name",
                    value:
                        fieldValue(data.caseName),
                    inline: true
                },

                {
                    name: "Case Number",
                    value:
                        fieldValue(data.caseNumber),
                    inline: true
                },

                {
                    name: "Proceeding Date",
                    value:
                        fieldValue(data.date),
                    inline: true
                },

                {
                    name: "Proceeding",
                    value:
                        fieldValue(data.proceeding),
                    inline: true
                },

                {
                    name: "Requested Member / Unit",
                    value:
                        fieldValue(data.member),
                    inline: false
                },

                {
                    name: "Reason",
                    value:
                        fieldValue(data.reason),
                    inline: false
                },

                {
                    name: "Additional Information",
                    value:
                        fieldValue(data.additional),
                    inline: false
                }

            ];

        }


        /*
         * ==========================================
         * FIRE RECORDS SUBPOENA
         * ==========================================
         */

        else if (
            requestType === "Fire Records Subpoena Request"
        ) {

            title =
                "New Fire Records Subpoena Request";

            color =
                11800859;


            fields = [

                {
                    name: "Request Number",
                    value: requestNumber,
                    inline: true
                },

                {
                    name: "Name",
                    value: name,
                    inline: true
                },

                {
                    name: "Organization",
                    value: organization,
                    inline: true
                },

                {
                    name: "Email",
                    value: email,
                    inline: true
                },

                {
                    name: "Case Name",
                    value:
                        fieldValue(data.caseName),
                    inline: true
                },

                {
                    name: "Case Number",
                    value:
                        fieldValue(data.caseNumber),
                    inline: true
                },

                {
                    name: "Court / Agency",
                    value:
                        fieldValue(data.court),
                    inline: true
                },

                {
                    name: "Proceeding",
                    value:
                        fieldValue(data.proceeding),
                    inline: true
                },

                {
                    name: "Incident Date",
                    value:
                        fieldValue(data.incidentDate),
                    inline: true
                },

                {
                    name: "Records Requested",
                    value:
                        fieldValue(data.records),
                    inline: false
                },

                {
                    name: "Additional Information",
                    value:
                        fieldValue(data.additional),
                    inline: false
                }

            ];

        }


        /*
         * ==========================================
         * ARSON INVESTIGATION REQUEST
         * ==========================================
         */

        else if (
            requestType === "Arson Investigation Report Request"
        ) {

            title =
                "🔥 New Arson Investigation Report Request";

            color =
                11801115;


            fields = [

                {
                    name: "Request Number",
                    value: requestNumber,
                    inline: true
                },

                {
                    name: "Requestor",
                    value:
                        `${fieldValue(data.firstName)} ${fieldValue(data.lastName)}`,
                    inline: true
                },

                {
                    name: "Requestor Type",
                    value:
                        fieldValue(data.requestorType),
                    inline: true
                },

                {
                    name: "Email",
                    value: email,
                    inline: false
                },

                {
                    name:
                        "Incident / Investigation Number",
                    value:
                        fieldValue(data.incidentNumber),
                    inline: true
                },

                {
                    name: "Incident Date",
                    value:
                        fieldValue(data.incidentDate),
                    inline: true
                },

                {
                    name: "Location",
                    value:
                        fieldValue(data.location),
                    inline: false
                },

                {
                    name: "Description",
                    value:
                        fieldValue(data.description),
                    inline: false
                },

                {
                    name: "Purpose",
                    value:
                        fieldValue(data.purpose),
                    inline: false
                }

            ];

        }


        /*
         * ==========================================
         * GENERAL RECORDS REQUEST
         * ==========================================
         */

        else {

            title =
                "New General Records Request";

            color =
                11800859;


            fields = [

                {
                    name: "Request Number",
                    value: requestNumber,
                    inline: true
                },

                {
                    name: "Name",
                    value: name,
                    inline: true
                },

                {
                    name: "Organization",
                    value: organization,
                    inline: true
                },

                {
                    name: "Email",
                    value: email,
                    inline: true
                },

                {
                    name: "Response Method",
                    value:
                        fieldValue(data.responseMethod),
                    inline: true
                },

                {
                    name: "Record Type",
                    value:
                        fieldValue(data.recordType),
                    inline: true
                },

                {
                    name: "Incident / Event Date",
                    value:
                        fieldValue(data.incidentDate),
                    inline: true
                },

                {
                    name:
                        "Incident / Event Number",
                    value:
                        fieldValue(data.incidentNumber),
                    inline: true
                },

                {
                    name: "Records Requested",
                    value:
                        fieldValue(data.records),
                    inline: false
                },

                {
                    name: "Additional Information",
                    value:
                        fieldValue(data.additional),
                    inline: false
                }

            ];

        }


        /*
         * ==========================================
         * DISCORD EMBED
         * ==========================================
         */

        const embed = {

            title: title,

            color: color,

            fields: fields,

            footer: {

                text:
                    "LAFD Records Portal • FiveM Roleplay"

            },

            timestamp:
                data.submittedAt ||
                new Date().toISOString()

        };


        /*
         * ==========================================
         * SEND TO DISCORD
         * ==========================================
         */

        const discordResponse =
            await fetch(
                webhook,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            username:
                                "LAFD Records Requests",

                            embeds: [
                                embed
                            ],

                            allowed_mentions: {
                                parse: []
                            }

                        })

                }
            );


        /*
         * ==========================================
         * DISCORD ERROR
         * ==========================================
         */

        if (!discordResponse.ok) {

            const discordError =
                await discordResponse.text();

            console.error(
                "Discord webhook error:",
                discordResponse.status,
                discordError
            );

            return res.status(500).json({

                success: false,

                message:
                    "The request could not be delivered."

            });

        }


        /*
         * ==========================================
         * SUCCESS
         * ==========================================
         */

        console.log(
            "Public records request submitted:",
            requestNumber,
            requestType
        );


        return res.status(200).json({

            success: true,

            message:
                "Request submitted successfully.",

            requestNumber:
                requestNumber

        });


    } catch (error) {

        /*
         * ==========================================
         * UNEXPECTED ERROR
         * ==========================================
         */

        console.error(
            "PublicRecords API error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }

}
