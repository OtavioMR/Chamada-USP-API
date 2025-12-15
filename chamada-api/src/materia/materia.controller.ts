import { Body, Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { MateriaService } from './materia.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { CreateMateriaDto } from './dto/create-materia.dto';

@Controller('materia')
export class MateriaController {
    constructor(private readonly materiaService: MateriaService) { }

    @UseGuards(JwtAuthGuard)
    @Post('cadastrar-materia')
    cadastrarMateria(@Body() dto: CreateMateriaDto, @Request() req) {
        return this.materiaService.cadastrarMateria(dto, req.user.id, req.user.role);
    }


    @UseGuards(JwtAuthGuard)
    @Get('minhas-materias')
    findAll(@Request() req) {
        return this.materiaService.findAll(req.user.id, req.user.role);
    }
}
