export async function sendEmail(to: string, subject: string, body: string) {
  console.log("=== ENVIAR E-MAIL ===");
  console.log("Para:   ", to);
  console.log("Assunto:", subject);
  console.log("Corpo:  ", body);
  console.log("=====================");
  return;
}
