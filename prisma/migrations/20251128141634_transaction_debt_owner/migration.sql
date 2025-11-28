-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_debtOwnerId_fkey" FOREIGN KEY ("debtOwnerId") REFERENCES "debt_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
