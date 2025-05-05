-- AddForeignKey
ALTER TABLE "Complain" ADD CONSTRAINT "Complain_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
