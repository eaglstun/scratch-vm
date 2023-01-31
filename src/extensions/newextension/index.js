const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const Cast = require("../../util/cast");
const log = require("../../util/log");
const { objectGrep } = require("object-grep");

class NewExtension {
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        return {
            id: "newextension",
            name: "New Extension",
            blocks: [
                {
                    opcode: "writeLog",
                    blockType: BlockType.COMMAND,
                    text: "log [TEXT]",
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "hello",
                        },
                    },
                },
                {
                    opcode: "sandwich",
                    blockType: BlockType.COMMAND,
                    text: "sando [MEAT] [CHEESE] [BREAD]",
                    arguments: {
                        MEAT: {
                            type: ArgumentType.STRING,
                            defaultValue: "ham",
                        },

                        CHEESE: {
                            type: ArgumentType.STRING,
                            defaultValue: "swiss",
                        },

                        BREAD: {
                            // type: ArgumentType.STRING,
                            defaultValue: ["rye"],
                        },
                    },
                },
            ],
            menus: {},
        };
    }

    sandwich(args, info, block) {
        console.log("sandwich args!");
        console.dir(args);
        objectGrep(args, "bbb");

        console.log("sandwich info!");
        console.dir(info);
        objectGrep(info, "bbb");

        console.log("sandwich block!");
        console.dir(block);
        objectGrep(block, "bbb");
    }

    writeLog(args) {
        const text = Cast.toString(args.TEXT);
        log.log(text);
    }
}

module.exports = NewExtension;
