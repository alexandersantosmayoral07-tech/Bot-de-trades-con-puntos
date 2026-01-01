import { Client, GatewayIntentBits } from "discord.js";
import fs from "fs";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const PREFIX = "+";
const MAX_POINTS = 50;
const DATA_FILE = "./points.json";

const NOTIFY_CHANNEL_ID = "1456092888952737833";

const STAFF_ROLES = [
  "1418712877426016319",
  "1416613885997355029"
];

const ROLE_REWARDS = {
  5: "1454953357360759018",
  10: "1454956321672790137",
  20: "1454956952504369202",
  30: "1454958077412376769",
  50: "1454958494649155746"
};

let points = fs.existsSync(DATA_FILE)
  ? JSON.parse(fs.readFileSync(DATA_FILE))
  : {};

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(points, null, 2));
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  if (!STAFF_ROLES.some(r => message.member.roles.cache.has(r))) {
    return message.reply("❌ No tienes permiso.");
  }

  const users = message.mentions.members;
  if (users.size !== 2) {
    return message.reply("Usa: +trade @user1 @user2");
  }

  const notify = message.guild.channels.cache.get(NOTIFY_CHANNEL_ID);

  for (const member of users.values()) {
    if (!points[member.id]) points[member.id] = 0;
    if (points[member.id] >= MAX_POINTS) continue;

    points[member.id]++;

    notify.send(`➕ ${member} recibió **1 punto** (Total: ${points[member.id]})`);

    if (ROLE_REWARDS[points[member.id]]) {
      await member.roles.add(ROLE_REWARDS[points[member.id]]);
      notify.send(`🎖️ ${member} obtuvo un rol por llegar a ${points[member.id]} puntos`);
    }
  }

  save();
});

client.login(process.env.TOKEN);
