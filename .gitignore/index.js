//Contantes
const Discord = require('discord.js')
const Bot = new Discord.Client()
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('database.json')
const db = low(adapter)

db.defaults({xp: []})
.write()

//Variables
var version = '1.02.beta'
var msg_accueil = "Tout le staff du serveur L'île de la famille vous remercie de vous être joint à notre communauté et nous espérons que vous vous amuserez sur notre serveur"
var msg_bienvenue = "$name$ vient d'arriver dans l'île de la famille, bienvenue à toi :wink:"

Bot.login(process.env.TOKEN)

Bot.on('ready', () => {

Bot.user.setPresence({ game: { name: 'se fait bronzé au soleil', type: 0 } });
console.log("Bot en ligne");
Bot.channels.find("name", 'console').send('je suis en ligne, ma version: ' + version)
});

Bot.on('guildMemberAdd', membre =>{
    membre.sendMessage(msg_accueil)
    var msg = msg_bienvenue

    msg = msg.replace('$name$', membre.user.username)

    membre.guild.channels.find('name', 'accueil').send(msg)
})

Bot.on('guildMemberRemove', membre =>{
    membre.guild.channels.find('name', 'départs').send(membre.user.username + ' nous à quitté :cry:')
})

Bot.on('message', message =>{

    var commande = '!'

    var msg_author = message.author.id

    if(message.author.bot) return;

if(!message.content.startsWith(commande))
{
    if(!db.get("xp").find({user: msg_author}).value())
    {
        db.get("xp").push({user: msg_author, xp: 1, level: 0}).write()
    }
    else
    {
        var userxpdb = db.get("xp").filter({user: msg_author}).find('xp').value()
        console.log(userxpdb)
        var userxp = Object.values(userxpdb)
        console.log(`Nombre d'xp: ${userxp[1]}`)
        console.log(`Nombre de level: ${userxp[2]}`)
        var nv_xp = userxp[1]
        var nv_lvl = userxp[2]
        if(userxp[1] == 30)
        {
            nv_xp = 1
            nv_lvl += 1
            message.channel.send(`Bravo @${message.author.username}, vous avez atteint le niveau ${nv_lvl}`)
            message.reply(`Bravo, vous avez atteint le niveau ${nv_lvl}`)
        }
        else
        {
            nv_xp += 1
        }

        db.get("xp").find({user: msg_author}).assign({user: msg_author, xp: nv_xp, level: nv_lvl}).write()
    }
}

    if(message.content.startsWith(commande + "xpstat"))
    {
        var xp = db.get("xp").filter({user: msg_author}).find('xp').value()
        var xp_final = Object.values(xp)
        var xp_embed = new Discord.RichEmbed()
        .setTitle(`XP de ${message.author}`)
        .setDescription("Voici vos statistiques :wink:")
        .addField("Votre XP : ", `${xp_final[1]}`)
        .addField(`Votre niveau: `, xp_final[2])
        message.channel.send({embed: xp_embed})
    }

    if(!message.content.startsWith(commande)) return;
    var args = message.content.substr(commande.length).split(" ")




    if(message.content.startsWith(commande))
    {
        Ecrire_Channel('console', nom() + ' ' + message.content)

        if(message.deletable)
        {
            message.delete()
        }
    }

    if(message.content.startsWith(commande + 'game'))
    {
        if(is_fondateur(true) == false && is_Moderateur(true) == false)
        {
            message.author.sendMessage('Vous avez entré une commande interdite, vous avez été signalé')
            return
        }

        try {
            var jeu = message.content.split(';')
            jeu.shift()
            jeu = jeu.join('')
        } catch (error) {
            message.author.sendMessage("Une erreur est survenue lors de la saisie de la commande, vérifié que vous avez bien mis ; entre la commande et le jeu à afficher")
            return
        }
        Bot.user.setPresence({ game: { name: jeu, type: 0 } });
    }

    if(message.content.startsWith(commande + 'ban'))
    {
        if(is_fondateur(true) == false && is_Moderateur(true) == false)
        {
            message.author.sendMessage('Vous avez entré une commande interdite, vous avez été signalé')
            return
        }

        message.mentions.members.forEach(membres =>{
            if(membres.bannable == false)
            {
                message.author.sendMessage('Le membre que vous avez essayé de bannir, ne peut pas être banni.')
            }
            else
            {
                membres.user.sendMessage(nom() + ' à décidé de vous bannir')
                membres.ban()
            }
        })
    }

    if(message.content.startsWith(commande + 'exclure'))
    {
        if(is_fondateur(true) == false && is_Moderateur(true) == false)
        {
            message.author.sendMessage('Vous avez entré une commande interdite, vous avez été signalé')
            return
        }

        message.mentions.members.forEach(membres =>{
            if(membres.kickable == false)
            {
                message.author.sendMessage("Impossible d'exclure le membre que vous avez mentionné (" + membres.user.username  + ')')
            }
            else
            {
                membres.sendMessage(nom() + ' à décidé de vous exclure.')
                membres.kick()
            }
        })
    }

    if(message.content.startsWith(commande + "role.add"))
    {
        if(is_fondateur(false) == false && is_Moderateur(true) == false)
        {
            message.author.sendMessage('Vous avez entré une commande interdite, vous avez été signalé')
            return
        }

        message.mentions.members.forEach(membres =>{
            message.mentions.roles.forEach(role =>{
                membres.addRole(role)
            })
        })
    }

    if(message.content.startsWith(commande + 'role.remove'))
    {

        if(is_fondateur(false) == false && is_Moderateur(true) == false)
        {
            message.author.sendMessage('Vous avez entré une commande interdite, vous avez été signalé')
            return
        }

        message.mentions.members.forEach(membres =>{
            message.mentions.roles.forEach(role =>{
                if(membres.roles.has(role))
                {
                    membres.removeRole(role)
                }
                else
                {
                    message.author.sendMessage("Le membre " + membres.user.username + " ne possède pas le rôle " + role.name)
                }
            })
        })
    }

    if(message.content.startsWith(commande + 'surnom.ajouter'))
    {

        if((is_fondateur(true) == false && is_Moderateur(true) == false) || message.author.username != message.mentions.members.first().user.username)
        {
            message.author.sendMessage('Vous avez entré une commande interdite, vous avez été signalé')
            return
        }

        try{
        var surnom = message.content.split(';')
        surnom.shift()
        surnom = surnom.join('')
        } catch (error) {
            message.author.sendMessage('Une erreur est survenue, vérifiez que vous avez correctement entré la commande')
        }

        message.mentions.members.forEach(membre =>{
            membre.setNickname(surnom)
        })
    }

    if(message.content.startsWith(commande + 'surnom.supprimer'))
    {

        if(is_fondateur(true) == false && is_Moderateur(true) == false)
        {
            message.author.sendMessage('Vous avez entré une commande interdite, vous avez été signalé')
            return
        }
        
        message.mentions.members.forEach(membre =>{
            if(membre.nickname == undefined || membre.nickname == null)
            {
                message.author.sendMessage( membre.user.username + " ne possède pas de surnom")
            }
            else
            {
                membre.setNickname(null)
            }
        })
    }



    function is_fondateur(msg)
    {
        if(message.member.roles.find('name', 'Fondateur'))
        {
            return true
        }
        else
        {
            if(msg)
            {
                message.guild.roles.find('name', 'Fondateur').members.forEach(membres =>{
                    membres.user.sendMessage(nom() + " à essayé d'entrer une commande interdite (" + message.content + ')')
                })
            }
        }
    }

    function is_Moderateur(msg)
    {
        if(message.member.roles.find('name', 'modérateur') || message.member.roles.find('name', 'Fondateur'))
        {
            return true
        }
        else
        {
            if(msg)
            {
                message.guild.roles.find('name', 'Fondateur').members.forEach(membres =>{
                    membres.user.sendMessage(nom() + " à essayé d'entrer une commande interdite (" + message.content + ')')
                })
            }
        }
    }

    function nom()
    {
        var nom

        nom = message.author.username

        if(message.member.nickname == undefined)
        {
            nom = nom = ' (' + message.member.nickname + ')'
        }

        return nom
    }

    function Ecrire_Channel(nom, msg)
    {
        try {
          Bot.channels.find("name", nom).send(msg)  
        } catch (error) {
            
        }
        
    }

})
