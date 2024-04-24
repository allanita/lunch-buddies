import prisma from "@/prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: { id?: string[] } }) {
  if (params.id && params.id.length > 0) return NextResponse.json({ message: "Invalid url" }, { status: 404 });

  const orders = await prisma.order.findMany({ where: { createdAt: { gte: new Date() } } });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest, { params }: { params: { id?: string[] } }) {
  if (params.id && params.id.length > 0) return NextResponse.json({ message: "Invalid url" }, { status: 404 });

  const orderSchema = z.object({
    total_order: z.number(),
    comment: z.string().nullish(),
    menuId: z.string(),
    userId: z.string(),
  });

  const body = await req.json();
  const validation = orderSchema.safeParse(body);

  if (!validation.success) return NextResponse.json(validation.error.errors, { status: 400 });

  await prisma.order.create({ data: body });

  return NextResponse.json({ message: "Order created successfully" });
}

export async function DELETE(req: NextRequest, { params }: { params: { id?: string[] } }) {
  if (!params.id?.length || params.id.length > 1) return NextResponse.json({ message: "Invalid url" }, { status: 404 });

  await prisma.order.delete({ where: { id: params.id[0] } });

  return NextResponse.json({ message: "Deleted successfully" });
}
