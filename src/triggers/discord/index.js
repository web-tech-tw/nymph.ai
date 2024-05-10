"use strict";

const {
    useClient,
} = require("../../clients/discord");

exports.startListen = () => {
    const client = useClient();

    const triggers = {
        interactionCreate: require("./interaction_create"),
        messageCreate: require("./message_create"),
    };
    for (const [key, trigger] of Object.entries(triggers)) {
        client.on(key, trigger);
    }
};
