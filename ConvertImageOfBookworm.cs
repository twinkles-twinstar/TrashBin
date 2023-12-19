// 将 PopCap 游戏 Bookworm 中 PAK 文件内的 png/jpg/gif 混合图像转换为单一的 png 格式

using System;
using ImageMagick; // see https://github.com/dlemstra/Magick.NET

public class ConvertImageOfBookworm {

	private static List<String> ListFile (
		String target,
		Int32  depth,
		String pattern = "*"
	) {
		var parentFullName = new DirectoryInfo(target).FullName;
		return Directory.EnumerateFiles(target, pattern, new EnumerationOptions() { RecurseSubdirectories = true, MaxRecursionDepth = depth }).Select((value) => (value[(parentFullName.Length + 1)..])).ToList();
	}

	public static void MakeImage (
		String? colorFile,
		String? alphaFile,
		String  complexFile
	) {
		if (colorFile == null && alphaFile == null) {
			throw new Exception();
		}
		var colorImage = colorFile == null ? null : new MagickImage(colorFile, new MagickReadSettings() { ColorType = ColorType.TrueColorAlpha });
		var alphaImage = alphaFile == null ? null : new MagickImage(alphaFile, new MagickReadSettings() { ColorType = ColorType.TrueColorAlpha });
		var complexImage = new MagickImage(new MagickColor(255, 255, 255, 255), (colorImage ?? alphaImage)!.Width, (colorImage ?? alphaImage)!.Height);
		complexImage.HasAlpha = true;
		//Console.WriteLine($"{colorImage?.ColorType}, {colorImage?.ColorSpace}, {colorImage?.ChannelCount}");
		//Console.WriteLine($"{alphaImage?.ColorType}, {alphaImage?.ColorSpace}, {alphaImage?.ChannelCount}");
		var colorPixels = colorImage?.GetPixels();
		var alphaPixels = alphaImage?.GetPixels();
		var complexPixels = complexImage.GetPixels();
		for (var y = 0; y < complexImage.Height; y++) {
			for (var x = 0; x < complexImage.Width; x++) {
				var color = colorPixels?.GetPixel(x, y);
				var alpha = alphaPixels?.GetPixel(x, y);
				var complex = complexPixels.GetPixel(x, y);
				if (color != null) {
					complex.SetChannel(0, color.GetChannel(0));
					complex.SetChannel(1, color.GetChannel(1));
					complex.SetChannel(2, color.GetChannel(2));
					if (color.Channels >= 4) {
						complex.SetChannel(3, color.GetChannel(3));
					}
				}
				if (alpha != null) {
					complex.SetChannel(3, alpha.GetChannel(0));
				}
				//Console.WriteLine($"{complex.GetChannel(0)}, {complex.GetChannel(1)}, {complex.GetChannel(2)}, {complex.GetChannel(3)}");
			}
		}
		Directory.CreateDirectory(Path.GetDirectoryName(complexFile) ?? "/");
		complexImage.Write(complexFile, MagickFormat.Png);
		return;
	}

	public static void IterateDirectory (
		String source,
		String destination
	) {
		var itemList = ConvertImageOfBookworm.ListFile(source, 100);
		var itemNameList = itemList.Where((value) => (value.EndsWith(".png") || value.EndsWith(".jpg") || value.EndsWith(".gif"))).Select((value) => (Path.ChangeExtension(value, null))).Select((value) => (value.EndsWith("_") ? value[..^1] : value)).Distinct().ToList();
		Console.WriteLine($"total : file {itemList.Count} , item {itemNameList.Count}");
		var processedItem = new List<String>();
		foreach (var itemName in itemNameList) {
			var complexItem = $"{destination}/{itemName}.png";
			var colorItem = itemList.Find((value) => (value.StartsWith($"{itemName}.png"))) ?? itemList.Find((value) => (value.StartsWith($"{itemName}.jpg"))) ?? itemList.Find((value) => (value.StartsWith($"{itemName}.gif")));
			var alphaItem = itemList.Find((value) => (value.StartsWith($"{itemName}_.")));
			ConvertImageOfBookworm.MakeImage(colorItem == null ? null : $"{source}/{colorItem}", alphaItem == null ? null : $"{source}/{alphaItem}", complexItem);
			processedItem.Add(colorItem ?? "");
			processedItem.Add(alphaItem ?? "");
			if (colorItem == null) {
				Console.WriteLine($"only alpha : {alphaItem}");
			}
			if (alphaItem == null) {
				Console.WriteLine($"only color : {colorItem}");
			}
		}
		Console.WriteLine($"unprocessed item :");
		foreach (var item in itemList) {
			if (!processedItem.Contains(item)) {
				Console.WriteLine($"{item}");
			}
		}
		return;
	}

	public static void Main (
	) {
		Console.Write("input the source directory : ");
		var source = Console.ReadLine() ?? throw new Exception();
		Console.Write("input the destination directory : ");
		var destination = Console.ReadLine() ?? throw new Exception();
		try {
			ConvertImageOfBookworm.IterateDirectory(source, destination);
			Console.WriteLine("done");
		}
		catch (Exception e) {
			Console.Write("error");
			Console.WriteLine(e);
		}
		return;
	}

}
