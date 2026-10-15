import { NextResponse } from 'next/server'

export function apiServerError(context:string,error:unknown){
  console.error(context,error)
  return NextResponse.json(
    {error:'We could not complete that action right now. Please try again.'},
    {status:500}
  )
}
