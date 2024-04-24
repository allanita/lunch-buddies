import prisma from "@/prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { exclude } from "@/lib/exlude";

export async function GET(req: NextRequest) {
  const orders = await prisma.order.findMany({ where: { createdAt: { gte: new Date() } } });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {}
