import prisma from "@/prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { exclude } from "@/lib/exlude";

export async function GET(req: NextRequest, { params }: { params: { id?: string[] } }) {
  if (params.id && params.id.length > 0) return NextResponse.json({ message: "Invalid url" }, { status: 404 });

  const users = await prisma.user.findMany({
    where: { role: { not: "admin" } },
  });

  return NextResponse.json(users.map((x) => exclude(x, ["password"])));
}

export async function POST(req: NextRequest, { params }: { params: { id?: string[] } }) {
  if (params.id && params.id.length > 0) return NextResponse.json({ message: "Invalid url" }, { status: 404 });

  const userSchema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(1),
    role: z.enum(["admin", "employee", "supplier"]),
  });

  const body = await req.json();
  const validation = userSchema.safeParse(body);

  if (!validation.success) return NextResponse.json(validation.error.errors, { status: 400 });

  const hashedPw = await bcrypt.hash(body.password, 10);

  const data = {
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    password: hashedPw,
    role: body.role,
  };
  await prisma.user.create({ data });

  return NextResponse.json({ message: "User created successfully" });
}

export async function PUT(req: NextRequest, { params }: { params: { id?: string[] } }) {
  if (!params.id?.length || params.id.length > 1) return NextResponse.json({ message: "Invalid url" }, { status: 404 });

  const userSchema = z.object({
    first_name: z.string().min(1).nullish(),
    last_name: z.string().min(1).nullish(),
    email: z.string().email().nullish(),
    password: z.string().min(1).nullish(),
    role: z.enum(["admin", "employee", "supplier"]).nullish(),
  });

  let body = await req.json();
  const validation = userSchema.safeParse(body);

  if (!validation.success) return NextResponse.json(validation.error.errors, { status: 400 });

  const oldData = await prisma.user.findUnique({ where: { id: params.id[0] } });

  if (!oldData) return NextResponse.json({ message: "Data not found" }, { status: 404 });

  if (body.password) {
    body.password = await bcrypt.hash(body.password, 10);
  }

  body = exclude({ ...oldData, ...body }, ["id"]);

  await prisma.user.update({
    where: { id: params.id[0] },
    data: body,
  });

  return NextResponse.json({ message: "Updated successfully" });
}

export async function DELETE(req: NextRequest, { params }: { params: { id?: string[] } }) {
  if (!params.id?.length || params.id.length > 1) return NextResponse.json({ message: "Invalid url" }, { status: 404 });

  await prisma.user.delete({ where: { id: params.id[0] } });

  return NextResponse.json({ message: "Deleted successfully" });
}
