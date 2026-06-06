import { NextResponse } from 'next/server'
import { AppError } from './errors'
import { ZodError } from 'zod'

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function apiList<T>(
  data: T[],
  meta: { total: number; page: number; pageSize: number }
) {
  return NextResponse.json({ data, meta })
}

export function apiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    )
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: error.flatten().fieldErrors,
        },
      },
      { status: 422 }
    )
  }

  console.error('Unexpected error:', error)
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
    { status: 500 }
  )
}
