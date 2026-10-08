import { describe, expect, it } from 'vitest';

import { AgentRuntimeErrorType } from '@/agent-runtime';
import { ChatErrorType } from '@/types/fetch';

import { createErrorResponse } from './errorResponse';

describe('createErrorResponse', () => {
  it('returns a 401 status for NoOpenAIAPIKey error type', () => {
    const errorType = ChatErrorType.NoOpenAIAPIKey;
    const response = createErrorResponse(errorType);
    expect(response.status).toBe(401);
  });

  it('returns a 401 status for InvalidAccessCode error type', () => {
    const errorType = ChatErrorType.InvalidAccessCode;
    const response = createErrorResponse(errorType as any);
    expect(response.status).toBe(401);
  });

  it('returns a 401 status for Invalid error type', () => {
    const errorType = 'InvalidTestError';
    const response = createErrorResponse(errorType as any);
    expect(response.status).toBe(401);
  });

  it('returns a 403 status for LocationNotSupportError error type', () => {
    const errorType = AgentRuntimeErrorType.LocationNotSupportError;
    const response = createErrorResponse(errorType);
    expect(response.status).toBe(403);
  });

  describe('Provider Biz Error', () => {
    it('returns a 471 status for OpenAIBizError error type', () => {
      const errorType = ChatErrorType.OpenAIBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(471);
    });

    it('returns a 470 status for AgentRuntimeError error type', () => {
      const errorType = AgentRuntimeErrorType.AgentRuntimeError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(470);
    });

    it('returns a 471 status for OpenAIBizError error type', () => {
      const errorType = AgentRuntimeErrorType.OpenAIBizError;
      const response = createErrorResponse(errorType as any);
      expect(response.status).toBe(471);
    });

    it('returns a 472 status for AzureBizError error type', () => {
      const errorType = AgentRuntimeErrorType.AzureBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(472);
    });

    it('returns a 473 status for ZhipuBizError error type', () => {
      const errorType = AgentRuntimeErrorType.ZhipuBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(473);
    });

    it('returns a 474 status for BedrockBizError error type', () => {
      const errorType = AgentRuntimeErrorType.BedrockBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(474);
    });

    it('returns a 475 status for GoogleBizError error type', () => {
      const errorType = AgentRuntimeErrorType.GoogleBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(475);
    });

    it('returns a 476 status for MoonshotBizError error type', () => {
      const errorType = AgentRuntimeErrorType.MoonshotBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(476);
    });

    it('returns a 478 status for OllamaBizError error type', () => {
      const errorType = AgentRuntimeErrorType.OllamaBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(478);
    });

    it('returns a 479 status for PerplexityBizError error type', () => {
      const errorType = AgentRuntimeErrorType.PerplexityBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(479);
    });

    it('returns a 480 status for AnthropicBizError error type', () => {
      const errorType = AgentRuntimeErrorType.AnthropicBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(480);
    });

    it('returns a 481 status for MistralBizError error type', () => {
      const errorType = AgentRuntimeErrorType.MistralBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(481);
    });

    it('returns a 477 status for TomechatBizError error type', () => {
      const errorType = AgentRuntimeErrorType.TomechatBizError;
      const response = createErrorResponse(errorType);
      expect(response.status).toBe(477);
    });

  });

  it('falls back to 500 and logs an error when the status code is not a number or not in the range of 200-599', () => {
    const errorType = 'Unknown Error';
    const consoleSpy = vi.spyOn(console, 'error');
    const response = createErrorResponse(errorType as any);
    expect(response.status).toBe(500);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('returns the same error type as status for unknown error types', () => {
    const errorType = 500;
    const response = createErrorResponse(errorType as any);
    expect(response.status).toBe(errorType);
  });

  it('returns a Response object with the correct body and errorType', () => {
    const errorType = ChatErrorType.NoOpenAIAPIKey;
    const body = { message: 'No API key provided' };
    const response = createErrorResponse(errorType, body);
    return response.json().then((data) => {
      expect(data).toEqual({
        body,
        errorType,
      });
    });
  });

  it('returns a Response object with an undefined body when no body is provided', () => {
    const errorType = ChatErrorType.NoOpenAIAPIKey;
    const response = createErrorResponse(errorType);
    return response.json().then((data) => {
      expect(data.body).toBeUndefined();
    });
  });
});
