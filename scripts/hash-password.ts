import bcrypt from "bcryptjs";

async function main(): Promise<void> {
  const password = process.argv[2];
  if (!password) {
    throw new Error("Использование: npm run hash:password -- <пароль>");
  }

  console.log(await bcrypt.hash(password, 12));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});