import { Markup } from "telegraf";

export function getMenu() {
  return Markup.keyboard([
    ["Мои задачи",  "Инструкция"],["Получить мотивацию"],
  ]).resize();
}

export function noYesKeyboard() {
  return Markup.inlineKeyboard(
    [ Markup.button.callback("Да", "true"),Markup.button.callback("Нет", "false")],
    { columns: 2 }
  );
}
