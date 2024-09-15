export function mergeInputValues(...nums: number[]) {
  for (let i = 0; i < nums.length; i++) {
    if (Math.abs(nums[i]) > 0) {
      return nums[i];
    }
  }
  return 0;
}
