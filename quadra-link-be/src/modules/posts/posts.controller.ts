import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

    // 🆕 Create a new post
    @Post()
    create(@Request() req, @Body() createPostDto: CreatePostDto) {
        const userId = req.user.id;
        return this.postsService.create(userId, createPostDto);
    }

    // 📄 Get all posts
    @Get()
    findAll() {
        return this.postsService.findAll();
    }

    // 📄 Get a specific post by ID
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(id);
    }

    // 🗑️ Delete a post by ID
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        return this.postsService.remove(id, userId);
    }

    // ✏️ Update a post by ID
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePostDto, @Request() req) {
        const userId = req.user.id;
        return this.postsService.update(id, userId ,updatePostDto);
    }

    // 🆕 Add a comment to a post
    @Post('comment')
    addComment(@Request() req, @Body() createCommentDto) {
        const userId = req.user.id;
        return this.postsService.addComment(userId, createCommentDto);
    }

    // Delete a comment by ID
    @Delete('comment/:id')
    deleteComment(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        return this.postsService.deleteComment(id, userId);
    }

    // 👍 Like a post
    @Post('like')
    likePost(@Request() req, @Body() createLikeDto) {
        const userId = req.user.id;
        return this.postsService.likePost(userId, createLikeDto);
    }

    // 👎 Unlike a post
    @Post('unlike')
    unlikePost(@Request() req, @Body() createLikeDto) {
        const userId = req.user.id;
        return this.postsService.unlikePost(userId, createLikeDto);
    }



}