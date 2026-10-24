import {
  StallRepository,
  type CreateStallInput,
  type FindAllParams,
} from '../repositories/stallRepository.ts';
import { MenuItemRepository } from '../repositories/menuItemRepository.ts';
import type { MenuItemDto, StallResponseDto } from '../dtos/stallDto.ts';
import { AppError } from '../errors/AppError.ts';
import { NotFoundError } from '../errors/NotFoundError.ts';
import { ForbiddenError } from '../errors/ForbiddenError.ts';
import type { AuthUser } from './tokenService.ts';
import type { CreateStallInput as StallInput } from '../schemas/stallSchema.ts';

type StallRow = NonNullable<Awaited<ReturnType<StallRepository['findById']>>>;

export class StallService {
  private stallRepository: StallRepository;
  private menuItemRepository: MenuItemRepository;

  constructor(
    stallRepository: StallRepository = new StallRepository(),
    menuItemRepository: MenuItemRepository = new MenuItemRepository(),
  ) {
    this.stallRepository = stallRepository;
    this.menuItemRepository = menuItemRepository;
  }

  private toDto(row: StallRow): StallResponseDto {
    const avgRating = Number(row.avgRating);
    return {
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      category: row.category,
      location: row.location,
      description: row.description,
      avgRating,
      reviewCount: row.reviewCount,
      isPopular: avgRating >= 4.7,
    };
  }

  async getAllStalls(params: FindAllParams) {
    const { rows, total } = await this.stallRepository.findAll(params);
    return { data: rows.map((row) => this.toDto(row)), total };
  }

  async getStallById(id: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.findById(id);
    if (!row) throw new NotFoundError('Warung tidak ditemukan');
    return this.toDto(row);
  }

  async getStallMenus(id: number): Promise<MenuItemDto[]> {
    const row = await this.stallRepository.findById(id);
    if (!row) throw new NotFoundError('Warung tidak ditemukan');
    return this.menuItemRepository.findByStallId(id);
  }

  async createStall(input: StallInput, ownerId: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.create({ ...input, ownerId });
    if (!row) throw new AppError(500, 'Warung gagal dibuat');
    return this.toDto(row);
  }

  async updateStall(
    id: number,
    input: Partial<StallInput>,
    user: AuthUser,
  ): Promise<StallResponseDto> {
    const existing = await this.stallRepository.findById(id);
    if (!existing) throw new NotFoundError('Warung tidak ditemukan');

    if (user.role !== 'admin' && existing.ownerId !== user.id) {
      throw new ForbiddenError('Kamu tidak punya akses ke resource ini');
    }

    const row = await this.stallRepository.update(id, input);
    if (!row) throw new NotFoundError('Warung tidak ditemukan');
    return this.toDto(row);
  }

  async deleteStall(id: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.remove(id);
    if (!row) throw new NotFoundError('Warung tidak ditemukan');
    return this.toDto(row);
  }
}
