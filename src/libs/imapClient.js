import { simpleParser } from 'mailparser';
import Imap from 'node-imap';

export function connectToImap() {
    return new Imap({
        user: "heyavanindra@gmail.com",
        password: "czsxtmcbfhfvvggn",
        host: "imap.gmail.com",
        port: 993,
        tls: true,
    });
}



export function fetchUnreadEmails() {
    return new Promise((resolve, reject) => {
        const imap = connectToImap();

        imap.once('ready', () => {
            console.log('IMAP connection ready');
            imap.openBox('INBOX', true, (err, box) => {
                if (err) return reject(err);

                imap.search([
                    'UNSEEN',
                    ['HEADER', 'SUBJECT', 'Interview invitation at Nivesh Jano']
                ], (err, results) => {
                    if (err || !results.length) {
                        imap.end();
                        return resolve([]);
                    }

                    const f = imap.fetch(results, { bodies: '' });
                    const parsePromises = [];

                    f.on('message', msg => {
                        msg.on('body', stream => {
                            const parsePromise = simpleParser(stream)
                                .then(parsed => parsed)
                                .catch(err => null);
                            parsePromises.push(parsePromise);
                        });
                    });

                    f.once('end', async () => {
                        console.log('Fetch complete');
                        const emails = await Promise.all(parsePromises);
                        imap.end();
                        resolve(emails.filter(Boolean)); // filter out failed parses
                    });
                });
            });
        });

        imap.once('error', err => reject(err));
        imap.connect();
    });
}