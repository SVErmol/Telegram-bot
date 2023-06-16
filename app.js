import express from "express";
import { PORT, TOKEN } from "./config.js";
import { Telegraf } from "telegraf";
import { session } from "telegraf";
import { getMenu, noYesKeyboard } from "./keyboards.js";
import { addMission, getMyMissions, deleteMission } from "./db.js";
import fs from "fs";

function getRandomImageWithCaption() {
  const imagesFolderPath = "./images";
  const captions = [
    "Когда все двигаются вперёд совместными усилиями, успех приходит сам собой",
    "Что люди могут выбирать, то они могут и изменить",
    "Ключом к успешному лидерству сегодня является влияние, а не авторитет",
    "Успех — это результат скрещивания удачи и тяжёлого труда",
    "Только упорный труд даёт желаемый результат. Только упорный труд несёт желаемые изменения",
  ];

  const imageFiles = fs.readdirSync(imagesFolderPath);
  const randomIndex = Math.floor(Math.random() * imageFiles.length);
  const randomImage = imageFiles[randomIndex];
  const randomCaption = captions[Math.floor(Math.random() * captions.length)];

  return { image: randomImage, caption: randomCaption };
}
const app = express();
const Tbot = new Telegraf(TOKEN);

Tbot.use(session());

Tbot.start((context) => {
  context.replyWithHTML(
    "Добро пожаловать в <b>to-do list</b>\n\n" +
      "Для добавления задачи необходимо ее <b>написать</b> и отправить боту",
    getMenu()
  );
});

Tbot.hears("Мои задачи", async (context) => {
  const missions = await getMyMissions();
  let results = "";

  for (let i = 0; i < missions.length; i++) {
    results = results + `${i + 1}. ${missions[i]}\n`;
  }

  if (results !== "") {
    context.replyWithHTML("<b>перечень задач:</b>\n\n" + `${results}`);
  } else {
    context.replyWithHTML("<b>перечень задач пуст</b>");
  }
});

Tbot.hears("Инструкция", (context) => {
  context.replyWithHTML(
    `Чтобы удалить задачу отправьте фразу <b>"удалить"</b> с указанием порядкового номера задачи. ` +
      `Например, <b>"удалить 3"</b>:\n\n ` +
      `Чтобы добавить новую задачу, просто напишите ее и отправьте боту. `
  );
});

Tbot.hears(/^удалить\s(\d+)$/, (context) => {
  const id = Number(+/\d+/.exec(context.message.text)) - 1;
  deleteMission(id);
  context.reply("Задача успешно удалена");
});

Tbot.hears("Получить мотивацию", (context) => {
  const { image, caption } = getRandomImageWithCaption();
  const imagePath = `./images/${image}`;

  context.replyWithPhoto(
    { source: imagePath },
    {
      caption: caption,
    }
  );
});

Tbot.on("text", (context) => {
  if (!context.session) context.session = {};

  context.session.missionText = context.message.text;

  context.replyWithHTML(
    `Вы действительно хотите добавить задачу:\n\n` +
      `<i>${context.message.text}</i>`,
    noYesKeyboard()
  );
});

Tbot.action(["true", "false"], (context) => {
  if (context.callbackQuery.data === "true") {
    addMission(context.session.missionText);
    context.editMessageText("Задача успешно добавлена");
  } else {
    context.deleteMessage();
  }
});

Tbot.launch();
app.listen(PORT, () => console.log(`Сервер запущен. Порт: ${PORT}`));