import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY as string);

interface SendEmailArgs {
  from: string;
  replyTo?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  text?: string;
  html?: string;
  react?: React.ReactNode;
  headers?: Record<string, string>;
  tags?: {
    name: string;
    value: string;
  }[];
  attachments?: {
    content?: string | Buffer;
    filename?: string | false | undefined;
    path?: string;
    contentType?: string;
  }[];
}

export const sendEmail = async (args: SendEmailArgs) => {
  const { error } = await resend.emails.send({
    ...args,
    text: args.text || "",
  });

  if (error) {
    throw error;
  }
};
