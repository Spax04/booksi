
export const azureTokenValidator = async (ctx: any, next: any) => {
  const azureToken = ctx.get('AAT');
  console.log('azureTokenValidator - azureToken', azureToken);
  if (azureToken == process.env.AAT) {
    return await next();
  }
  console.log('ERROR! azureTokenValidator - failure during token validation', { azureToken });
  ctx.status = 401;
  ctx.body = 'azr: forbidden - bad token';
};
