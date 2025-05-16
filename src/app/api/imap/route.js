import { Interview } from '@/db/models';
import connectDB from '@/libs/db_connect';
import { fetchUnreadEmails } from '@/libs/imapClient';

export async function GET() {
  await connectDB()
  const emails = await fetchUnreadEmails();

  const interviewKeywords = ['interview', 'interviewer', 'interviewee', 'google meet', 'meet.google.com'];

  const relevantEmails = emails.filter(email => {
    const subject = email.subject?.toLowerCase() || '';
    const body = email.text?.toLowerCase() || '';
    return interviewKeywords.some(keyword =>
      subject.includes(keyword) || body.includes(keyword)
    );
  });

  const interviewData = relevantEmails.map(email => {
    const subject = email.subject || '';
    const text = email.text || '';

    const data = {
      interviewer: extract(text, /Interviewer: (.+)/i),
      interviewee: extract(text, /Interviewee: (.+)/i),
      time: extract(text, /(?:Date|Time): (.+)/i),
      link: extract(text, /(https:\/\/meet\.google\.com\/[^\s]+)/i),
      participants: extractMultiple(text, /Participant: (.+)/gi),
      subject,
    };

    const userData = []

    if (data.interviewee !== null && data.interviewer !== null && data.link !== null && data.time !== null) {
      console.log(data)
      return data
    }




    return null;
  }).filter(Boolean);

  const inserted = [];

  for (const interview of interviewData) {
    const exists = await Interview.findOne({
      link: interview.link, 
    });

    console.log(exists)

    if (!exists) {
      const created = await Interview.create(interview);
      inserted.push(created);
    }
  }
  const interviews = await Interview.find({})

  return Response.json({ interviews });
}

function extract(str, regex) {
  const match = str.match(regex);
  return match ? match[1].trim() : null;
}

function extractMultiple(str, regex) {
  return [...str.matchAll(regex)].map(m => m[1].trim());
}
