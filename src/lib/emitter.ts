import mitt from "mitt";
import type { EmitterEvents } from "@/const.ts";

const emitter = mitt<EmitterEvents>();

export default emitter;
