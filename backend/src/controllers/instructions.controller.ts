import { Controller, Get, Post, Body, Query } from '@nestjs/common';

@Controller('instructions')
export class InstructionsController {
  private instructions = [
    { id: '1', title: 'Test Instruction' }
  ];

  @Get()
  getInstructions(@Query('q') query: string) {
    if (!query) return this.instructions;
    return this.instructions.filter(i => 
      i.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  @Post()
  addInstruction(@Body() instruction: { id: string; title: string }) {
    this.instructions.push(instruction);
    return { ok: true };
  }
}