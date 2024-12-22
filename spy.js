import fs from 'fs';

class Spy {
    logConversation(userName, userMessage, botReply) {
        const fileDirectory = `./chates/${userName}_ChatWithBot.txt`;
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}]\nКористувач ${userName}:\n${userMessage}\nБот:\n${botReply}\n\n`

        try{
            if (!fs.existsSync('./chates')) {
                fs.mkdirSync('./chates');
                console.log(`Created 'chates' directory!`);
            }

            if (!fs.existsSync(fileDirectory)) {
                fs.writeFileSync(fileDirectory, '', 'utf-8');
                console.log(`Created ${userName}_ChatWithBot.txt!`);
            }
            fs.appendFileSync(fileDirectory, logEntry, 'utf-8');
        } catch (error) {
            console.error('Spy Error: ', error);
        }        
    }
}

export default Spy;