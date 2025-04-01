import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleToken } from '../entities/index';

@Injectable()
export default class GoogleTokenService {
  constructor(
    @InjectRepository(GoogleToken)
    private readonly tokenRepository: Repository<GoogleToken>,
  ) {}

  async saveToken(
    accountId: string,
    refreshToken: string,
  ): Promise<GoogleToken> {
    const token = await this.tokenRepository.findOne({ where: { accountId } });

    if (token) {
      token.refreshToken = refreshToken;
      token.updated_at = new Date();
      return await this.tokenRepository.save(token);
    } else {
      const newToken = this.tokenRepository.create({
        accountId,
        refreshToken,
      });
      return await this.tokenRepository.save(newToken);
    }
  }

  async getToken(accountId: string): Promise<string | null> {
    const token = await this.tokenRepository.findOne({ where: { accountId } });
    return token?.refreshToken || null;
  }
}
