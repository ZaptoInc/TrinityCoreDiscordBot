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
      let onlinePlayers = {};
      api.database.query("use auth;");
      api.database.query(
        "select username, joindate, last_login, locale, reg_mail, online, id from account where online = 1;",
        (error1, accounts, fields1) => {
          api.database.query("use characters;");
          api.database.query(
            "select name, account, map from characters where online = 1;",
            async (error2, characters, fields2) => {
              accounts.forEach((account) => {
                if (!onlinePlayers[account.id]) {
                  onlinePlayers[account.id] = {};
                }
                onlinePlayers[account.id].account = account;
              });
              characters.forEach(async (character) => {
                if (!onlinePlayers[character.account]) {
                  onlinePlayers[character.account] = {};
                }
                onlinePlayers[character.account].character = character;
              });

              const onlinePlayersCount = Object.keys(onlinePlayers).length;

              console.log(onlinePlayers, onlinePlayersCount);

              let embed = new EmbedBuilder();
              embed.setTitle(
                `${onlinePlayersCount} player${
                  onlinePlayersCount > 1 ? "s" : ""
                } online`
              );
              let tempDesc = "";
              Object.values(onlinePlayers).forEach(async (player) => {
                if (tempDesc > 4000) {
                  embed.setDescription(tempDesc);
                  tempDesc = "";
                  if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [embed] });
                  } else {
                    await interaction.reply({ embeds: [embed] });
                  }
                }

                let isLinkedToDiscord = /^\d{17,19}$/.test(
                  player.account.reg_mail
                );
                if (player.character) {
                  tempDesc += `**${player.account.username}** ${
                    isLinkedToDiscord ? `(<@${player.account.reg_mail}>) ` : ""
                  }is connected since <t:${Math.floor(
                    new Date(player.account.last_login).getTime() / 1000
                  )}:R> (Currently playing as ${player.character.name})\r\n`;
                } else {
                  tempDesc += `**${player.account.username}** ${
                    isLinkedToDiscord ? `(<@${player.account.reg_mail}>) ` : ""
                  }is connected since <t:${Math.floor(
                    new Date(player.account.last_login).getTime() / 1000
                  )}:R>\r\n`;
                }
              });
              embed.setDescription(tempDesc);
              tempDesc = "";

              if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [embed] });
              } else {
                await interaction.reply({ embeds: [embed] });
              }
            }
          );
        }
      );
    },
  };
};
