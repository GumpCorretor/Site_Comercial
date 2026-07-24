-- CreateTable
CREATE TABLE "_database_anchor" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "_database_anchor_pkey" PRIMARY KEY ("id")
);
