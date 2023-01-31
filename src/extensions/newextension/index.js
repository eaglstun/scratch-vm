const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const Cast = require("../../util/cast");
const log = require("../../util/log");

class CoolThing {
    static _instance = 0;

    constructor() {
        // this.instance = this._instance;
        this.instance ++;
        console.log("new cool thing ", this.instance);
    }

    static get instance() {
        return this._instance || 0;
    }

    static set instance(v) {
        this._instance = v;
    }
}

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
                    opcode: "debug",
                    blockType: BlockType.COMMAND,
                    text: "debug [a]",
                    arguments: {
                        a: {
                            type: ArgumentType.STRING,
                            // defaultValue: "hello",
                        },
                    },
                },
                {
                    opcode: "hat",
                    blockType: BlockType.HAT,
                    text: "hat [a]",
                },
                {
                    opcode: "newclass",
                    blockType: BlockType.REPORTER,
                    text: "newclass [a]",
                },
                {
                    opcode: "reporter",
                    blockType: BlockType.REPORTER,
                    text: "reporter [a] ? [b] : [c]",
                    arguments: {
                        a: {
                            type: ArgumentType.STRING,
                            // defaultValue: "hello",
                        },
                        b: {
                            type: ArgumentType.STRING,
                            // defaultValue: "hello",
                        },
                        c: {
                            type: ArgumentType.STRING,
                            // defaultValue: "hello",
                        },
                    },
                },
                {
                    opcode: "conditional",
                    blockType: BlockType.CONDITIONAL,
                    text: "conditional [a] [b]",
                    arguments: {
                        a: {
                            type: ArgumentType.STRING,
                            // defaultValue: "hello",
                        },
                        b: {
                            type: ArgumentType.STRING,
                            // defaultValue: "hello",
                        },
                    },
                },
            ],
            menus: {},
        };
    }

    /**
     *
     * @param {*} args
     * @param {*} info
     * @param {*} block
     * @return
     */
    debug(args, info, block) {
        // console.log("debug args!");
        console.log("DEBUG", args);
    }

    hat(args, info, block) {
        console.log("hat args!");
        console.dir(args);
    }

    newclass(args, info, block) {
        console.log("newclass args!");
        console.dir(args);

        const r = new CoolThing();
        return JSON.stringify(r);
    }

    reporter(args, info, block) {
        // console.log("reporter args!");
        // console.dir(args);

        return args.a ? args.b : args.c;
    }

    conditional(args, info, block) {
        console.log("conditional args!");
        console.dir(args);

        // console.log("conditional info!");
        // console.dir(info);

        // console.log("conditional block!");
        // console.dir(block);
    }
}

module.exports = NewExtension;
