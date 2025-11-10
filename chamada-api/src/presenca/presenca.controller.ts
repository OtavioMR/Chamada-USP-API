import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { PresencaService } from './presenca.service';
import { dot } from 'node:test/reporters';
import { MarcarPresencaDto } from './dto/create-presenca.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';

@Controller('presenca')
export class PresencaController {
    constructor(private readonly presencaService: PresencaService) {}

    @UseGuards(JwtAuthGuard)
    @Post('marcar-presenca')
    create(@Body() dto: MarcarPresencaDto, @Request() req){
        return this.presencaService.create(dto, req.user.id);
    }
}
