const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = function (api) {
  return {
    data: new SlashCommandBuilder()
      .setName(api.i18n.translate("en", "wow.cmd.online"))
      .setDescription(api.i18n.translate("en", "wow.desc.online"))
      .setNameLocalizations(api.i18n.getAllTranslations("wow.cmd.online"))
      .setDescriptionLocalizations(
        api.i18n.getAllTranslations("wow.desc.online")
      ),
    async execute(interaction) {
      let counter = 0;
      let onlinePlayers = 0;
      api.database.query("use auth;");
      api.database.query(
        "select username, joindate, last_login, locale, reg_mail, online, id from account where online = 1;",
        (error1, accounts, fields1) => {
          api.database.query("use characters;");
          api.database.query(
            "select name, account from characters where online = 1;",
            (error2, characters, fields2) => {
              console.log(accounts, characters);
            }
          );
        }
      );

      let embed = new EmbedBuilder();
      embed.setDescription("testing");
      await interaction.reply({ embeds: [embed] });
    },
  };
};
