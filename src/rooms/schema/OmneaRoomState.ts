import { Schema, type ,MapSchema} from "@colyseus/schema";


export class Player extends Schema {
  @type("string") nickname: string;
  @type("string") avatar: string;
  @type("string") color1: string;
  @type("string") color2: string;
  @type("string") color3: string;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") z: number;
  @type("number") rx: number;
  @type("number") ry: number;
  @type("number") rz: number;
  @type("number") rw: number;
}

export class OmneaRoomState extends Schema {

  @type({ map: Player }) players = new MapSchema<Player>();

}
