import { UIX } from "uix/uix.ts";
import { UIX_CACHE_PATH } from "uix/uix_all.ts";
import Capture from './Capture.ts';
import { Path } from "uix/utils/path.ts";
import { timeout } from "unyt_core/datex_all.ts";

@endpoint export class Screenshot {
	@timeout(40_000)
	@property static async take(url: string | URL, config?: {
		width: number,
		height: number,
		fullSize?: boolean
	}): Promise<HTMLImageElement> {
		const fileName = `${url.toString().replaceAll(/[^a-zA-Z0-9\?\-\.]+/g, '_')}.png`;
		const filePath = UIX_CACHE_PATH.getChildPath(fileName);
		if (filePath.fs_exists)
			return this.getImage(filePath);

		const fileData = await Capture.take(
			url, 
			config?.fullSize, {
				width: config?.width ?? 1920,
				height: config?.height ?? 1080
			}
		);
		await Deno.writeFile(filePath, fileData);
		return this.getImage(filePath);
	}

	static getImage(filePath: Path<`${string}:`, boolean>) {
		return <img src={'/image/'.concat(filePath.name)}/> as HTMLImageElement;
	}
}

// The backend routes definition
export default {
	'/': null,
	'/image/*': new UIX.FileProvider(UIX_CACHE_PATH)
} satisfies UIX.Entrypoint;