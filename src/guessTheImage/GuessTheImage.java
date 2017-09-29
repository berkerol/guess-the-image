package guessTheImage;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.Toolkit;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Random;
import java.util.Scanner;
import javax.imageio.ImageIO;
import javax.swing.BorderFactory;
import javax.swing.ImageIcon;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JLayeredPane;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;

public class GuessTheImage {

    private static final ArrayList<String> ALL_NAMES = new ArrayList<>();
    private static final Random RANDOM = new Random();
    private static final double[] RESULTS = new double[6];
    private static final String TITLE = "GuessTheImage";
    private static ArrayList<File> allFiles;
    private static boolean answerType;
    private static boolean deleteFiles;
    private static boolean deleteNames;
    private static boolean firstTime = true;
    private static JFrame frame;
    private static File imageFile;
    private static String imageName;
    private static boolean openingControl;
    private static int openingLimit;
    private static int openings;
    private static JPanel[][] panels;
    private static int tilesHor;
    private static int tilesVer;

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                start();
            }
        });
    }

    private static void controls() {
        if (openings == tilesVer * tilesHor) {
            exit("Everything is visible, the image was " + imageName, JOptionPane.ERROR_MESSAGE);
            return;
        }
        if (openingControl && openings == openingLimit) {
            openingControl = false;
            int exit = JOptionPane.showConfirmDialog(null, "You have reached the limit for openings. Do you want to continue anyway?", TITLE, JOptionPane.YES_NO_OPTION);
            if ((exit == 1) || (exit == -1)) {
                exit("The image was " + imageName, JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private static void exit(String message, int messageType) {
        for (int i = 0; i < tilesVer; i++) {
            for (int j = 0; j < tilesHor; j++) {
                panels[i][j].setVisible(false);
            }
        }
        JOptionPane.showMessageDialog(null, message, TITLE, messageType);
        frame.dispose();
        RESULTS[0] += 1.0 * openings / (tilesVer * tilesHor) * 100;
        RESULTS[3]++;
        if (deleteFiles) {
            allFiles.remove(imageFile);
            if (deleteNames) {
                ALL_NAMES.remove(imageName);
            }
        }
        if (allFiles.isEmpty()) {
            JOptionPane.showMessageDialog(null, "No more images to guess.", TITLE, JOptionPane.ERROR_MESSAGE);
            statistics();
            return;
        }
        int exit = JOptionPane.showConfirmDialog(null, "Do you want to continue?", TITLE, JOptionPane.YES_NO_OPTION);
        if ((exit == 1) || (exit == -1)) {
            statistics();
        }
        else {
            start();
        }
    }

    private static void start() {
        Scanner input = null;
        try {
            input = new Scanner(new File("GuessTheImageConfiguration.ini"), "UTF-8");
        }
        catch (FileNotFoundException ex) {
            JOptionPane.showMessageDialog(null, ex, TITLE, JOptionPane.ERROR_MESSAGE);
            return;
        }
        answerType = input.nextInt() != 0;
        input.nextLine();
        deleteFiles = input.nextInt() != 0;
        input.nextLine();
        deleteNames = input.nextInt() != 0;
        input.nextLine();
        tilesHor = input.nextInt();
        input.nextLine();
        tilesVer = input.nextInt();
        input.nextLine();
        openingLimit = input.nextInt();
        if (openingLimit == 0) {
            openingLimit = tilesVer * tilesHor;
        }
        openingControl = true;
        if (firstTime) {
            firstTime = false;
            input.nextLine();
            allFiles = new ArrayList<>(Arrays.asList(new File(input.nextLine()).listFiles()));
            for (File file : allFiles) {
                ALL_NAMES.add(file.getName().split("\\.")[0]);
            }
        }
        input.close();
        openings = 0;
        imageFile = allFiles.get(RANDOM.nextInt(allFiles.size()));
        imageName = imageFile.getName().split("\\.")[0];
        BufferedImage originalImage = null;
        try {
            originalImage = ImageIO.read(imageFile);
        }
        catch (IOException ex) {
            JOptionPane.showMessageDialog(null, ex, TITLE, JOptionPane.ERROR_MESSAGE);
            return;
        }
        Dimension dimension = Toolkit.getDefaultToolkit().getScreenSize();
        int tileHeight = Math.min(originalImage.getHeight(), (int) dimension.getHeight()) / tilesVer;
        int tileWidth = Math.min(originalImage.getWidth(), (int) dimension.getWidth()) / tilesHor;
        int height = tileHeight * tilesVer, width = tileWidth * tilesHor;
        BufferedImage resizedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = resizedImage.createGraphics();
        g.setComposite(AlphaComposite.Src);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.drawImage(originalImage, 0, 0, width, height, null);
        g.dispose();
        frame = new JFrame(TITLE);
        frame.setSize(width, height);
        frame.setLocationRelativeTo(null);
        JLayeredPane layeredPane = new JLayeredPane();
        layeredPane.setBounds(0, 0, width, height);
        frame.add(layeredPane);
        JPanel image = new JPanel();
        image.add(new JLabel(new ImageIcon(resizedImage)));
        image.setBounds(0, 0, width, height);
        layeredPane.add(image, 0, 0);
        panels = new JPanel[tilesVer][tilesHor];
        for (int i = 0; i < panels.length; i++) {
            for (int j = 0; j < panels[0].length; j++) {
                panels[i][j] = new JPanel();
                panels[i][j].setBounds(j * tileWidth, i * tileHeight, tileWidth, tileHeight);
                panels[i][j].setBorder(BorderFactory.createLineBorder(Color.BLACK));
                layeredPane.add(panels[i][j], 1, 0);
            }
        }
        frame.setVisible(true);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        layeredPane.addMouseListener(new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                for (int i = 0; i < tilesVer; i++) {
                    for (int j = 0; j < tilesHor; j++) {
                        if (e.getX() >= j * tileWidth && e.getX() <= (j + 1) * tileWidth && e.getY() >= i * tileHeight && e.getY() <= (i + 1) * tileHeight && panels[i][j].isVisible()) {
                            panels[i][j].setVisible(false);
                            openings++;
                            controls();
                            return;
                        }
                    }
                }
            }
        });
        frame.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                int key = e.getKeyCode();
                if (key == KeyEvent.VK_G) {
                    exit("The image was " + imageName, JOptionPane.ERROR_MESSAGE);
                }
                if (key == KeyEvent.VK_SPACE) {
                    int x, y;
                    do {
                        x = RANDOM.nextInt(tilesVer);
                        y = RANDOM.nextInt(tilesHor);
                    }
                    while (!panels[x][y].isVisible());
                    panels[x][y].setVisible(false);
                    openings++;
                    controls();
                }
                if (key == KeyEvent.VK_ENTER) {
                    Object object;
                    if (answerType) {
                        object = JOptionPane.showInputDialog(null, "Guess the image!", TITLE,
                                JOptionPane.QUESTION_MESSAGE, null, ALL_NAMES.toArray(), ALL_NAMES.get(0));
                    }
                    else {
                        object = JOptionPane.showInputDialog(null, "Guess the image!", TITLE, JOptionPane.QUESTION_MESSAGE);
                    }
                    if (object == null) {
                        return;
                    }
                    if (((String) object).equalsIgnoreCase(imageName)) {
                        RESULTS[1] += 1.0 * openings / (tilesVer * tilesHor) * 100;
                        RESULTS[4]++;
                        if (openings < openingLimit && openingLimit != tilesVer * tilesHor) {
                            RESULTS[2] += 1.0 * openings / (tilesVer * tilesHor) * 100;
                            RESULTS[5]++;
                        }
                        exit("You guessed correctly!", JOptionPane.INFORMATION_MESSAGE);
                    }
                    else {
                        exit("You guessed wrong, the image was " + imageName, JOptionPane.ERROR_MESSAGE);
                    }
                }
            }
        });
    }

    private static void statistics() {
        String message = String.format("Total games: %.0f", RESULTS[3]);
        if (RESULTS[4] != 0) {
            message += String.format("%nTotal correct games: %.0f", RESULTS[4]);
        }
        if (RESULTS[5] != 0) {
            message += String.format("%nTotal correct games within the limit: %.0f", RESULTS[5]);
        }
        message += String.format("%nTotal openings: %.2f %%", RESULTS[0]);
        if (RESULTS[1] != 0) {
            message += String.format("%nTotal correct openings: %.2f %%", RESULTS[1]);
        }
        if (RESULTS[2] != 0) {
            message += String.format("%nTotal correct openings within the limit: %.2f %%", RESULTS[2]);
        }
        message += String.format("%nAverage openings: %.2f %%", RESULTS[0] / RESULTS[3]);
        if (RESULTS[4] != 0) {
            message += String.format("%nAverage correct openings: %.2f %%", RESULTS[1] / RESULTS[4]);
        }
        if (RESULTS[5] != 0) {
            message += String.format("%nAverage correct openings within the limit: %.2f %%", RESULTS[2] / RESULTS[5]);
        }
        JOptionPane.showMessageDialog(null, message, TITLE, JOptionPane.INFORMATION_MESSAGE);
    }
}
