export type PlayerId = "human" | "ai_ulster" | "ai_munster" | "ai_connacht";
export type OwnerId = PlayerId | "neutral";

export interface PlayerDef {
  id: PlayerId;
  name: string;
  /** Default control at the setup screen; the player can toggle this before the campaign starts. */
  isHuman: boolean;
  capital: string;
}

export const PLAYERS: PlayerDef[] = [
    { id:"human",      name:"Leinster",  isHuman:true,  capital:"DUB" },
    { id:"ai_ulster",  name:"Ulster",    isHuman:false, capital:"ANT" },
    { id:"ai_munster", name:"Munster",   isHuman:false, capital:"COR" },
    { id:"ai_connacht",name:"Connacht",  isHuman:false, capital:"GAL" },
  ];

export const COLOR_HEX: Record<OwnerId, string> = {
    human:"#3f8f5f", ai_ulster:"#d9b23c", ai_munster:"#3f7fb0", ai_connacht:"#ece7d8", neutral:"#6b6558"
  };
