// Vercel Serverless Function Entry Point
// This file adapts the Hono app for Vercel's serverless environment

import app from '../dist/_worker.js'

export default async function handler(req, res) {
  try {
    // Convert Vercel request to Web Request
    const url = new URL(req.url, `https://${req.headers.host}`)
    
    const request = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers),
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined
    })

    // Call Hono app
    const response = await app.fetch(request)

    // Convert Web Response to Vercel response
    const body = await response.text()
    
    res.status(response.status)
    
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })
    
    res.send(body)
  } catch (error) {
    console.error('Vercel handler error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
