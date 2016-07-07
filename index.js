'use strict';
var TelegramBot = require('node-telegram-bot-api');
var watson = require('watson-developer-cloud');

var token = 'SEU_TOKEN';
var bot = new TelegramBot(token, { polling: true });
var chatId = 0;

const comidas = [
    [{ text: 'Pizza', callback_data: '0' }, { text: 'Feijao', callback_data: '1' }],
    [{ text: 'Hamburger', callback_data: '2' }, { text: 'Arroz', callback_data: '3' }],
    [{ text: 'Macarrão', callback_data: '4' }]
];


const optionsInlineKeyboardComidas = {
    reply_markup: JSON.stringify({
        inline_keyboard: comidas
    })
};


const optionsKeyBoard = {
    reply_markup: JSON.stringify({ 'keyboard': [['1', '2']] })
};

bot.on('callback_query', function (msg) {
    console.log('callback_query', msg.data);
    bot.answerCallbackQuery(msg.id, 'Muito obrigado pela preferência, entraremos em contato!', true)
        .then((result) => {
            enviarMensagem(chatId, 'Conte-nos como foi sua experiencia!').then(message => {
                bot.onReplyToMessage(message.chat.id, message.message_id, (m) => {
                    analisarMensagem(m.text);
                    enviarMensagem(chatId, 'Obrigado!');
                });
            });

        });
});

bot.on('message', function (msg) {
    console.log('msg', msg);
    if (msg.text.toLowerCase().indexOf('com') != -1)
        enviarMensagemComidas(msg);

    else if (msg.text.toLowerCase().indexOf('jap') != -1)
        enviarFoto(msg);
});

function enviarMensagem(chatId, text) {
    return bot.sendMessage(chatId, text);
}
    
function enviarMensagemComidas(msg) {
    chatId = msg.chat.id;
    const mensagem = `Olá ${msg.from.first_name}, nosso cardápio é: `;
    optionsInlineKeyboardComidas.reply_to_message = msg.message_id;
    bot.sendMessage(chatId, mensagem, optionsInlineKeyboardComidas);
}


function enviarFoto(msg) {
    bot.sendPhoto(msg.chat.id, 'fu.jpg', { caption: 'Esse nao tem :/' });
}

// function enviarMensagemComTeclado(msg) {
//     chatId = msg.chat.id;
//     const mensagem = ` 1 - Mulheres`;
//     optionsKeyBoard.reply_to_message = msg.message_id;
//     bot.sendMessage(chatId, mensagem, optionsKeyBoard);
// }



///// analise
const tone_analyzer = watson.tone_analyzer({
    username: 'SEU_USERNAME',
    password: 'SUA_SENHA',
    version: 'v3',
    version_date: '2016-05-19'
});

const language_translation = watson.language_translator({
    "url": "https://gateway.watsonplatform.net/language-translation/api",
    "password": "SUA_SENHA",
    "username": "SEU_USERNAME",
    version: 'v2'
});
function analisarMensagem(text) {
    traduzirParaIngles(text, (traducao) => {
        analisarSentimento(traducao);
    });
}

function analisarSentimento(text) {
    console.log('texto traduzido', text);
    tone_analyzer.tone({ text: text }, (err, tone) => {
        if (err) console.log(err);
        else
            console.log(JSON.stringify(tone, null, 2));
    });


}

function traduzirParaIngles(text, cb) {
    language_translation.translate({
        text: text,
        source: 'pt-br',
        target: 'en'
    },
        (err, translation) => {
            console.log('traducao', translation);
            if (err) console.log(err);
            else return cb((translation.translations[0]).translation);

            cb(null, null);
        });
}